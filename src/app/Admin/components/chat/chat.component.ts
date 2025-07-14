import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MensajeChatDTO } from '../../../../dtos/mensajeChat.dto';
import { ChatService } from '../../Services/chat.service';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Avatar } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../Services/usuario.service';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    Button,
    ProgressSpinner,
    Avatar,
    FormsModule

  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();
  private typingSubject = new Subject<string>();

  @Input() claseId!: number;
  @Input() codigoSala!: string;
  @Input() esInstructor: boolean = false;
  @Input() mostrarChat: boolean = true;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Estado del chat
  mensajes: MensajeChatDTO[] = [];
  nuevoMensaje: string = '';
  connectionState: string = 'disconnected';
  loading: boolean = false;

  // Paginación
  paginaActual: number = 0;
  hayMasPaginas: boolean = false;
  cargandoHistorial: boolean = false;

  // Usuarios escribiendo
  usuariosEscribiendo: Set<number> = new Set();

  // Permisos
  puedeParticipar: boolean = false;
  puedeEnviarMensajes: boolean = false;

  // UI
  mostrarEmojiPicker: boolean = true;
  mensajeEditando?: MensajeChatDTO;
  shouldScrollToBottom: boolean = true;

  usuarioActua!: UsuarioDTO;
  usuarioActualId!: number;


  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private usuarioService: UsuarioService,
    private ngZone: NgZone // ✅ AGREGAR NgZone


  ) { }

  ngOnInit(): void {
    this.inicializarChat();
    this.configurarEventListeners();
    this.usuarioService.obtenerUsuario()
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.usuarioActua = usuario;
        this.usuarioActualId = usuario.cveUsuario ?? 0;
      });

  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.chatService.desconectarChat();
    this.destroy$.next();
    this.destroy$.complete();
  }
  private async inicializarChat(): Promise<void> {
    try {
      this.loading = true;

      // Verificar permisos
      const permisos = await this.chatService.verificarPermisos(this.claseId).toPromise();
      this.puedeParticipar = permisos?.puedeParticipar || false;
      this.puedeEnviarMensajes = permisos?.puedeEnviarMensajes || false;

      if (!this.puedeParticipar) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Acceso Restringido',
          detail: 'No tienes permisos para participar en este chat'
        });
        return;
      }

      // Cargar historial inicial
      await this.cargarHistorial();

      // ✅ CONECTAR WebSocket (ahora es async)
      await this.chatService.conectarChat(this.codigoSala, this.claseId);

      this.loading = false;

    } catch (error) {
      console.error('Error inicializando chat:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al inicializar el chat'
      });
      this.loading = false;
    }
  }

  private configurarEventListeners(): void {
    // Escuchar estado de conexión
    this.chatService.getMensajes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mensaje => {
        this.ngZone.run(() => {
          if ((mensaje as any)._delete) {
            this.mensajes = this.mensajes.filter(m => m.cveMensajeChat !== mensaje.cveMensajeChat);
            return;
          }

          if ((mensaje as any)._update) {
            const index = this.mensajes.findIndex(m => m.cveMensajeChat === mensaje.cveMensajeChat);
            if (index !== -1) {
              this.mensajes[index] = mensaje;
            }
            return;
          }

          // Agregar mensaje normal
          this.agregarMensaje(mensaje);
          this.shouldScrollToBottom = true;
        });
      });


    // Indicadores de typing
    this.chatService.getTypingStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ usuarioId, isTyping }) => {
        this.ngZone.run(() => {
          if (isTyping) {
            this.usuariosEscribiendo.add(usuarioId);
          } else {
            this.usuariosEscribiendo.delete(usuarioId);
          }
        });
      });

    // Estado de conexión
    this.chatService.getConnectionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.ngZone.run(() => {
          this.connectionState = state;
        });
      });
    // Configurar debounce para typing indicators
    this.typingSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(contenido => {
        if (contenido.trim()) {
          this.chatService.enviarTyping();
        } else {
          this.chatService.enviarStopTyping();
        }
      });

    this.chatService.getMensajeEliminado()
  .pipe(takeUntil(this.destroy$))
  .subscribe(mensajeId => {
    console.log('🔥 Mensaje eliminado recibido:', mensajeId, typeof mensajeId);
    this.ngZone.run(() => {
      this.mensajes = this.mensajes.filter(m => m.cveMensajeChat !== Number(mensajeId));
    });
  });


    this.chatService.getMensajeEditado()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mensajeEditado => {
        this.ngZone.run(() => {
          mensajeEditado.esMio = mensajeEditado.usuarioId === this.usuarioActualId;
          const idx = this.mensajes.findIndex(m => m.cveMensajeChat === mensajeEditado.cveMensajeChat);
          if (idx !== -1) {
            this.mensajes[idx] = mensajeEditado;
          }
        });
      });




  }

  private async cargarHistorial(): Promise<void> {
    try {
      this.cargandoHistorial = true;

      const historial = await this.chatService.obtenerHistorial(this.claseId, this.paginaActual).toPromise();

      if (historial) {
        if (this.paginaActual === 0) {
          this.mensajes = historial.mensajes;
          this.shouldScrollToBottom = true;
        } else {
          // Cargar mensajes anteriores al inicio
          this.mensajes = [...historial.mensajes, ...this.mensajes];
        }

        this.hayMasPaginas = historial.hayMasPaginas;
      }

      this.cargandoHistorial = false;
    } catch (error) {
      console.error('Error cargando historial:', error);
      this.cargandoHistorial = false;
    }
  }

  // Enviar mensaje
  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.puedeEnviarMensajes) {
      return;
    }

    if (this.mensajeEditando) {
      this.guardarEdicion();
      return;
    }

    this.chatService.enviarMensajeWebSocket(this.nuevoMensaje);

    // ✅ FORZAR detección de cambios
    this.ngZone.run(() => {
      this.nuevoMensaje = '';
    });

    this.chatService.enviarStopTyping();
  }

  // Manejar input de texto
  onInputChange(): void {
    this.typingSubject.next(this.nuevoMensaje);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  // Cargar más mensajes
  cargarMasMensajes(): void {
    if (this.hayMasPaginas && !this.cargandoHistorial) {
      this.paginaActual++;
      this.cargarHistorial();
    }
  }

  // Editar mensaje
  editarMensaje(mensaje: MensajeChatDTO): void {
    if (!mensaje.esMio) return;

    this.mensajeEditando = mensaje;
    this.nuevoMensaje = mensaje.contenido;
    this.messageInput.nativeElement.focus();
  }

  guardarEdicion(): void {
    if (!this.mensajeEditando || !this.nuevoMensaje.trim()) return;

    // 1. Editar en backend (permiso/persistencia)
    this.chatService.editarMensaje(this.mensajeEditando.cveMensajeChat!, this.nuevoMensaje)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mensajeActualizado) => {
          // 2. Broadcast en tiempo real a todos los usuarios
          this.chatService.editarMensajeWebSocket(mensajeActualizado.cveMensajeChat!, mensajeActualizado.contenido);

          // 3. Actualiza el mensaje localmente (opcional, ya lo hará el WebSocket, pero así es instantáneo)
          const index = this.mensajes.findIndex(m => m.cveMensajeChat === mensajeActualizado.cveMensajeChat);
          if (index !== -1) {
            this.mensajes[index] = mensajeActualizado;
          }
          this.cancelarEdicion();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Mensaje editado correctamente'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al editar el mensaje'
          });
        }
      });
  }

  cancelarEdicion(): void {
    this.mensajeEditando = undefined;
    this.nuevoMensaje = '';
  }


  // Eliminar mensaje
  eliminarMensaje(mensaje: MensajeChatDTO): void {
    if (!mensaje.cveMensajeChat) return;

    // 1. Elimina en backend (permiso/persistencia)
    this.chatService.eliminarMensajeWebSocket(mensaje.cveMensajeChat);
    // Eliminación local (opcional, ya que el WebSocket debería actualizar la lista)
    this.mensajes = this.mensajes.filter(m => m.cveMensajeChat !== mensaje.cveMensajeChat);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Mensaje eliminado'
    });
  }


  // Limpiar chat (solo instructor)
  limpiarChat(): void {
    if (!this.esInstructor) return;

    this.chatService.limpiarChat(this.claseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mensajes = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Chat limpiado correctamente'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al limpiar el chat'
          });
        }
      });
  }

  // Utilidades
  private agregarMensaje(mensaje: MensajeChatDTO): void {
    if (!this.mensajes.find(m => m.cveMensajeChat === mensaje.cveMensajeChat)) {
      mensaje.esMio = mensaje.usuarioId === this.usuarioActualId; // ✅ Marcar si es mío
      this.mensajes.push(mensaje);
    }
  }


  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Getters para el template
  get connectionStatusIcon(): string {
    const icons = {
      'connected': 'pi pi-check-circle',
      'connecting': 'pi pi-spin pi-spinner',
      'disconnected': 'pi pi-times-circle',
      'error': 'pi pi-exclamation-triangle'
    };
    return icons[this.connectionState as keyof typeof icons] || 'pi pi-circle';
  }

  get connectionStatusClass(): string {
    const classes = {
      'connected': 'text-green-500',
      'connecting': 'text-orange-500',
      'disconnected': 'text-red-500',
      'error': 'text-red-500'
    };
    return classes[this.connectionState as keyof typeof classes] || 'text-gray-500';
  }

  get usuariosEscribiendoTexto(): string {
    const count = this.usuariosEscribiendo.size;
    if (count === 0) return '';
    if (count === 1) return 'Alguien está escribiendo...';
    return `${count} personas están escribiendo...`;
  }

  formatearFecha(timestamp: string): string {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;

    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  trackByMensaje(index: number, mensaje: any): any {
    return mensaje.id || index;
  }



}