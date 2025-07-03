// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { MensajeChatDTO } from '../../dtos/mensajeChat.dto';
import { environment } from '../../../environment';
import { UsuarioDTO } from '../../dtos/usuario.dto';



export interface EnviarMensajeRequest {
  contenido: string;
  tipoMensaje?: 'TEXTO' | 'SISTEMA' | 'ARCHIVO' | 'EMOJI';
}

export interface HistorialChatResponse {
  mensajes: MensajeChatDTO[];
  totalMensajes: number;
  pagina: number;
  hayMasPaginas: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket?: WebSocket;
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private wsUrl = `${environment.wsUrl}/ws/chat`;

  // Subjects para eventos del chat
  private mensajesSubject = new Subject<MensajeChatDTO>();
  private typingSubject = new Subject<{ usuarioId: number; isTyping: boolean }>();
  private connectionStateSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  private eliminarMensajeSubject = new Subject<number>();
  private editarMensajeSubject = new Subject<MensajeChatDTO>();

  // Estado del chat
  private currentSala?: string;
  private currentClaseId?: number;
  private isConnected = false;

  private usuario!: UsuarioDTO;
  constructor(private http: HttpClient) { }

  // Observables públicos
  getMensajes(): Observable<MensajeChatDTO> {
    return this.mensajesSubject.asObservable();
  }

  getTypingStatus(): Observable<{ usuarioId: number; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }

  getConnectionState(): Observable<string> {
    return this.connectionStateSubject.asObservable();
  }

  // Conectar al WebSocket del chat
  async conectarChat(codigoSala: string, claseId: number): Promise<void> {
    if (this.socket) {
      this.desconectarChat();
    }

    this.currentSala = codigoSala;
    this.currentClaseId = claseId;
    this.connectionStateSubject.next('connecting');

    try {
      // ✅ USAR tu endpoint existente para obtener el usuario
      this.usuario = await this.http.get<any>(`${environment.apiUrl}/api/usuarios`, {
        headers: this.getHeaders()
      }).toPromise();

      const usuarioId = this.usuario.cveUsuario; // Ajustar según tu DTO
      const usuarioN = this.usuario.nombre; // Ajustar según tu DTO

      console.log("usuario detectado " + usuarioN + " con id" + usuarioId);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      if (!usuarioId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      let wsUrl = `${this.wsUrl}/${codigoSala}`;

      // ✅ ENVIAR usuarioId como query parameter
      const params = new URLSearchParams();
      params.append('usuarioId', usuarioId.toString());
      if (token) {
        params.append('token', token);
      }

      wsUrl += `?${params.toString()}`;

      console.log('Conectando a WebSocket:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Chat WebSocket conectado');
        this.isConnected = true;
        this.connectionStateSubject.next('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.procesarMensajeWebSocket(data);
        } catch (error) {
          console.error('Error procesando mensaje del chat:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Error en chat WebSocket:', error);
        this.connectionStateSubject.next('error');
      };

      this.socket.onclose = () => {
        console.log('Chat WebSocket desconectado');
        this.isConnected = false;
        this.connectionStateSubject.next('disconnected');
      };
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      this.connectionStateSubject.next('error');
    }
  }

  private procesarMensajeWebSocket(data: any): void {
  switch (data.type) {
    case 'new-message':
      this.mensajesSubject.next(data.mensaje);
      break;
    case 'user-typing':
      this.typingSubject.next({ usuarioId: data.usuarioId, isTyping: true });
      break;
    case 'user-stop-typing':
      this.typingSubject.next({ usuarioId: data.usuarioId, isTyping: false });
      break;

    case 'edit-message':
      this.editarMensajeSubject.next(data.mensaje);
      break;

    case 'delete-message':
        console.log('🧨 WebSocket delete-message recibido:', data);
      this.eliminarMensajeSubject.next(data.mensajeId);
      break;
  }
}


  // Enviar mensaje via WebSocket
  enviarMensajeWebSocket(contenido: string): void {
    if (!this.isConnected || !this.socket || !this.currentClaseId) {
      console.warn('Chat no conectado');
      return;
    }

    const mensaje = {
      type: 'chat-message',
      claseId: this.currentClaseId,
      contenido: contenido.trim()
    };

    this.socket.send(JSON.stringify(mensaje));
  }

  // Indicadores de escritura
  enviarTyping(): void {
    if (!this.isConnected || !this.socket) return;

    const typing = {
      type: 'typing'
    };

    this.socket.send(JSON.stringify(typing));
  }

  enviarStopTyping(): void {
    if (!this.isConnected || !this.socket) return;

    const stopTyping = {
      type: 'stop-typing'
    };

    this.socket.send(JSON.stringify(stopTyping));
  }

  desconectarChat(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.isConnected = false;
    this.currentSala = undefined;
    this.currentClaseId = undefined;
    this.connectionStateSubject.next('disconnected');
  }

  // Métodos HTTP para gestión del chat
  private getHeaders() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  obtenerHistorial(claseId: number, pagina: number = 0, tamaño: number = 50): Observable<HistorialChatResponse> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http.get<HistorialChatResponse>(
      `${this.apiUrl}/clase/${claseId}/historial`,
      { headers: this.getHeaders(), params }
    );
  }

  obtenerHistorialPorSala(codigoSala: string, pagina: number = 0, tamaño: number = 50): Observable<HistorialChatResponse> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http.get<HistorialChatResponse>(
      `${this.apiUrl}/sala/${codigoSala}/historial`,
      { headers: this.getHeaders(), params }
    );
  }

  editarMensaje(mensajeId: number, nuevoContenido: string): Observable<MensajeChatDTO> {
    return this.http.put<MensajeChatDTO>(
      `${this.apiUrl}/mensaje/${mensajeId}`,
      { contenido: nuevoContenido },
      { headers: this.getHeaders() }
    );
  }

  eliminarMensaje(mensajeId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/mensaje/${mensajeId}`,
      { headers: this.getHeaders() }
    );
  }

  limpiarChat(claseId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/clase/${claseId}/limpiar`,
      { headers: this.getHeaders() }
    );
  }

  verificarPermisos(claseId: number): Observable<{ puedeParticipar: boolean; puedeEnviarMensajes: boolean }> {
    return this.http.get<{ puedeParticipar: boolean; puedeEnviarMensajes: boolean }>(
      `${this.apiUrl}/clase/${claseId}/permisos`,
      { headers: this.getHeaders() }
    );
  }

  obtenerEstadisticas(claseId: number): Observable<{ totalMensajes: number; timestamp: string }> {
    return this.http.get<{ totalMensajes: number; timestamp: string }>(
      `${this.apiUrl}/clase/${claseId}/estadisticas`,
      { headers: this.getHeaders() }
    );

  }


  getMensajeEliminado(): Observable<number> {
    return this.eliminarMensajeSubject.asObservable();
  }

  getMensajeEditado(): Observable<MensajeChatDTO> {
    return this.editarMensajeSubject.asObservable();
  }

  // Eliminar mensaje
  eliminarMensajeWebSocket(mensajeId: number): void {
    if (!this.isConnected || !this.socket) return;
    const msg = {
      type: 'delete-message',
      mensajeId
    };
    this.socket.send(JSON.stringify(msg));
  }

  // Editar mensaje
  editarMensajeWebSocket(mensajeId: number, contenido: string): void {
    if (!this.isConnected || !this.socket) return;
    const msg = {
      type: 'edit-message',
      mensajeId,
      contenido
    };
    this.socket.send(JSON.stringify(msg));
  }


}