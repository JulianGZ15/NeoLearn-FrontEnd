import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';

import { MessageService, ConfirmationService } from 'primeng/api';
import { PreguntaDTO } from '../../../../dtos/pregunta.dto';
import { RespuestaDTO } from '../../../../dtos/respuesta.dto';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';
import { PreguntasClientService } from '../../services/preguntas-client.service';
import { RespuestasClientService } from '../../services/respuestas-client.service';
import { UsuarioService } from '../../../Admin/Services/usuario.service';
import { CommonModule } from '@angular/common';
import { Button, ButtonModule } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
interface PreguntaConRespuestas extends PreguntaDTO {
  respuestas: RespuestaDTO[];
  usuario?: UsuarioDTO;
  mostrarRespuestas: boolean;
  cargandoRespuestas: boolean;
}

interface RespuestaConUsuario extends RespuestaDTO {
  usuario?: UsuarioDTO;
}

@Component({
  selector: 'app-preguntas-client',
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinner,
    CardModule,
    AvatarModule,
    DividerModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule
  ],
  templateUrl: './preguntas-client.component.html',
  styleUrl: './preguntas-client.component.scss'
})
export class PreguntasClientComponent implements OnInit, OnDestroy {
  cveCurso!: number;
  preguntas: PreguntaConRespuestas[] = [];
  usuarioActual?: UsuarioDTO;
  
  // Estados de carga
  loading = false;
  enviandoPregunta = false;
  
  // Formulario nueva pregunta
  mostrarFormularioPregunta = false;
  nuevaPregunta: PreguntaDTO = {};
  
  
  // Formulario nueva respuesta
  preguntaSeleccionada?: PreguntaConRespuestas;
  nuevaRespuesta: RespuestaDTO = {};
  enviandoRespuesta = false;
  mostrarModalRespuesta = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private preguntasService: PreguntasClientService,
    private respuestasService: RespuestasClientService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cveCurso = +params['id'];
      this.cargarDatosIniciales();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatosIniciales() {
    this.loading = true;
    
    forkJoin({
      usuario: this.usuarioService.obtenerUsuario(),
      preguntas: this.preguntasService.listarPreguntasPorCurso(this.cveCurso)
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.usuarioActual = data.usuario;
        this.procesarPreguntas(data.preguntas);
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las preguntas'
        });
      }
    });
  }

  private procesarPreguntas(preguntas: PreguntaDTO[]) {
    this.preguntas = preguntas.map(pregunta => ({
      ...pregunta,
      respuestas: [],
      mostrarRespuestas: false,
      cargandoRespuestas: false
    }));
    
    // Cargar información de usuarios para cada pregunta
    this.preguntas.forEach(pregunta => {
      if (pregunta.cveUsuario) {
        this.usuarioService.obtenerUsuarioPorId(pregunta.cveUsuario)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (usuario) => {
              pregunta.usuario = usuario;
            },
            error: (error) => {
              console.error('Error al cargar usuario:', error);
            }
          });
      }
    });
  }

  // Gestión de preguntas
  mostrarFormularioNuevaPregunta() {
    this.mostrarFormularioPregunta = true;
    this.nuevaPregunta = {};
  }

  cancelarNuevaPregunta() {
    this.mostrarFormularioPregunta = false;
    this.nuevaPregunta = {};
  }

  enviarPregunta() {
    if (!this.nuevaPregunta.contenido?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingresa el contenido de la pregunta'
      });
      return;
    }

    this.enviandoPregunta = true;
    
    const preguntaData: PreguntaDTO = {
      ...this.nuevaPregunta,
      cveCurso: this.cveCurso,
      cveUsuario: this.usuarioActual?.cveUsuario
    };

    this.preguntasService.crearPregunta(this.cveCurso, preguntaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.enviandoPregunta = false)
      )
      .subscribe({
        next: (preguntaCreada) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pregunta enviada correctamente'
          });
          
          // Agregar la nueva pregunta a la lista
          const nuevaPreguntaConRespuestas: PreguntaConRespuestas = {
            ...preguntaCreada,
            respuestas: [],
            usuario: this.usuarioActual,
            mostrarRespuestas: false,
            cargandoRespuestas: false
          };
          
          this.preguntas.unshift(nuevaPreguntaConRespuestas);
          this.cancelarNuevaPregunta();
        },
        error: (error) => {
          console.error('Error al enviar pregunta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo enviar la pregunta'
          });
        }
      });
  }

  eliminarPregunta(pregunta: PreguntaConRespuestas) {
    if (pregunta.cveUsuario !== this.usuarioActual?.cveUsuario) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Solo puedes eliminar tus propias preguntas'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres eliminar esta pregunta?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (pregunta.cvePregunta) {
          this.preguntasService.eliminarPregunta(pregunta.cvePregunta)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.preguntas = this.preguntas.filter(p => p.cvePregunta !== pregunta.cvePregunta);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Pregunta eliminada correctamente'
                });
              },
              error: (error) => {
                console.error('Error al eliminar pregunta:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la pregunta'
                });
              }
            });
        }
      }
    });
  }

  // Gestión de respuestas
  toggleRespuestas(pregunta: PreguntaConRespuestas) {
    pregunta.mostrarRespuestas = !pregunta.mostrarRespuestas;
    
    if (pregunta.mostrarRespuestas && pregunta.respuestas.length === 0) {
      this.cargarRespuestas(pregunta);
    }
  }

  private cargarRespuestas(pregunta: PreguntaConRespuestas) {
    if (!pregunta.cvePregunta) return;
    
    pregunta.cargandoRespuestas = true;
    
    this.respuestasService.listarRespuestasPorPregunta(pregunta.cvePregunta)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => pregunta.cargandoRespuestas = false)
      )
      .subscribe({
        next: (respuestas) => {
          pregunta.respuestas = respuestas;
          
          // Cargar información de usuarios para cada respuesta
          respuestas.forEach(respuesta => {
            if (respuesta.cveUsuario) {
              this.usuarioService.obtenerUsuarioPorId(respuesta.cveUsuario)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (usuario) => {
                    (respuesta as RespuestaConUsuario).usuario = usuario;
                  },
                  error: (error) => {
                    console.error('Error al cargar usuario de respuesta:', error);
                  }
                });
            }
          });
        },
        error: (error) => {
          console.error('Error al cargar respuestas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las respuestas'
          });
        }
      });
  }

  
  // ... resto del código ...

  responderPregunta(pregunta: PreguntaConRespuestas) {
    this.preguntaSeleccionada = pregunta;
    this.nuevaRespuesta = {};
    this.mostrarModalRespuesta = true; // Mostrar modal
  }

  cancelarRespuesta() {
    this.preguntaSeleccionada = undefined;
    this.nuevaRespuesta = {};
    this.mostrarModalRespuesta = false; // Ocultar modal
  }

  enviarRespuesta() {
    if (!this.nuevaRespuesta.contenido?.trim() || !this.preguntaSeleccionada?.cvePregunta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingresa el contenido de la respuesta'
      });
      return;
    }

    this.enviandoRespuesta = true;
    
    const respuestaData: RespuestaDTO = {
      ...this.nuevaRespuesta,
      cvePregunta: this.preguntaSeleccionada.cvePregunta,
      cveUsuario: this.usuarioActual?.cveUsuario
    };

    this.respuestasService.crearRespuesta(this.preguntaSeleccionada.cvePregunta, respuestaData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.enviandoRespuesta = false)
      )
      .subscribe({
        next: (respuestaCreada) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Respuesta enviada correctamente'
          });
          
          // Agregar la nueva respuesta a la pregunta
          const respuestaConUsuario: RespuestaConUsuario = {
            ...respuestaCreada,
            usuario: this.usuarioActual
          };
          
          this.preguntaSeleccionada!.respuestas.push(respuestaConUsuario);
          this.cancelarRespuesta(); // Esto ahora también cierra el modal
        },
        error: (error) => {
          console.error('Error al enviar respuesta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo enviar la respuesta'
          });
        }
      });
  }

  eliminarRespuesta(respuesta: RespuestaDTO, pregunta: PreguntaConRespuestas) {
    if (respuesta.cveUsuario !== this.usuarioActual?.cveUsuario) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Solo puedes eliminar tus propias respuestas'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres eliminar esta respuesta?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (respuesta.cveRespuesta) {
          this.respuestasService.eliminarRespuesta(respuesta.cveRespuesta)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                pregunta.respuestas = pregunta.respuestas.filter(r => r.cveRespuesta !== respuesta.cveRespuesta);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Respuesta eliminada correctamente'
                });
              },
              error: (error) => {
                console.error('Error al eliminar respuesta:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'No se pudo eliminar la respuesta'
                });
              }
            });
        }
      }
    });
  }

  // Utilidades
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerIniciales(nombre: string | undefined): string {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  esAutorPregunta(pregunta: PreguntaConRespuestas): boolean {
    return pregunta.cveUsuario === this.usuarioActual?.cveUsuario;
  }

  esAutorRespuesta(respuesta: RespuestaDTO): boolean {
    return respuesta.cveUsuario === this.usuarioActual?.cveUsuario;
  }

  // Agregar este método a la clase PreguntasClientComponent
obtenerInicialesRespuesta(respuesta: RespuestaDTO): string {
  const respuestaConUsuario = respuesta as RespuestaConUsuario;
  return this.obtenerIniciales(respuestaConUsuario.usuario?.nombre);
}

obtenerNombreUsuarioRespuesta(respuesta: RespuestaDTO): string {
  const respuestaConUsuario = respuesta as RespuestaConUsuario;
  return respuestaConUsuario.usuario?.nombre || 'Usuario';
}

}