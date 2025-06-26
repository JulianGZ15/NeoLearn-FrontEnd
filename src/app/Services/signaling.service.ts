import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environment';

type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'join' | 'user-joined' | 'user-left' | 'existing-participants';

interface SignalMessage {
  type: SignalType;
  senderId: string;
  targetId?: string;
  userId?: string; // ✅ Agregar userId opcional
  participantes?: number; // ✅ Agregar participantes opcional
  data: any;
}


@Injectable({ providedIn: 'root' })
export class SignalingService {
  private socket!: WebSocket;
  private senderId: string = this.generarId();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private currentSala?: string;

  // Estado de conexión
  private connectionState$ = new BehaviorSubject<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Subjects para eventos reactivos
  private userJoined$ = new Subject<string>();
  private userLeft$ = new Subject<string>();
  private participantsUpdate$ = new Subject<string[]>();

  // Callbacks existentes
  private onOffer?: (senderId: string, data: RTCSessionDescriptionInit) => void;
  private onAnswer?: (senderId: string, data: RTCSessionDescriptionInit) => void;
  private onIceCandidate?: (senderId: string, data: RTCIceCandidateInit) => void;
  private onUserJoined?: (userId: string) => void;
  private onUserLeft?: (userId: string) => void;
  private onExistingParticipants?: (participants: string[]) => void;

  connect(codigoSala: string): void {
    this.currentSala = codigoSala;
    this.connectionState$.next('connecting');
    
    // Cerrar conexión existente si la hay
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(`${environment.wsUrl}/ws/sala/${codigoSala}`);

    this.socket.onopen = () => {
      console.log('WebSocket conectado a sala:', codigoSala);
      this.connectionState$.next('connected');
      this.reconnectAttempts = 0;
      this.sendMessage('join', { timestamp: new Date().toISOString() }, undefined);
    };

    this.socket.onmessage = (event) => {
      try {
        const message: SignalMessage = JSON.parse(event.data);
        console.log('Mensaje recibido:', message);

        if (message.senderId === this.senderId) return;

        this.procesarMensaje(message);
        
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error WebSocket:', error);
      this.connectionState$.next('error');
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket cerrado:', event.code, event.reason);
      this.connectionState$.next('disconnected');

      // Intentar reconectar si no fue cierre intencional
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(codigoSala);
      }
    };
  }

// signaling.service.ts
private procesarMensaje(message: SignalMessage): void {
  console.log('Procesando mensaje:', message);
  
  switch (message.type) {
    case 'offer':
      this.onOffer?.(message.senderId, message.data);
      break;
      
    case 'answer':
      this.onAnswer?.(message.senderId, message.data);
      break;
      
    case 'ice-candidate':
      this.onIceCandidate?.(message.senderId, message.data);
      break;
      
    case 'user-joined':
      // ✅ Corregir: el userId puede estar en data o en el nivel raíz
      const joinedUserId = message.userId || message.data?.userId || message.senderId;
      console.log('Usuario se unió:', joinedUserId);
      this.onUserJoined?.(joinedUserId);
      this.userJoined$.next(joinedUserId);
      break;
      
    case 'user-left':
      // ✅ Corregir: el userId puede estar en data o en el nivel raíz
      const leftUserId = message.userId || message.data?.userId || message.senderId;
      console.log('Usuario se fue:', leftUserId);
      this.onUserLeft?.(leftUserId);
      this.userLeft$.next(leftUserId);
      break;
      
    case 'existing-participants':
      const participants = message.data?.participants || message.data || [];
      console.log('Participantes existentes:', participants);
      this.onExistingParticipants?.(participants);
      this.participantsUpdate$.next(participants);
      break;
      
    default:
      console.warn('Tipo de mensaje no reconocido:', message.type);
  }
}


  private attemptReconnect(codigoSala: string): void {
    this.reconnectAttempts++;
    console.log(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(codigoSala);
    }, this.reconnectInterval);
  }

  // Observables para manejo reactivo
  getConnectionState(): Observable<string> {
    return this.connectionState$.asObservable();
  }

  getUserJoined(): Observable<string> {
    return this.userJoined$.asObservable();
  }

  getUserLeft(): Observable<string> {
    return this.userLeft$.asObservable();
  }

  getParticipantsUpdate(): Observable<string[]> {
    return this.participantsUpdate$.asObservable();
  }

  // Métodos de envío
  sendOffer(targetId: string, offer: RTCSessionDescriptionInit): void {
    this.sendMessage('offer', offer, targetId);
  }

  sendAnswer(targetId: string, answer: RTCSessionDescriptionInit): void {
    this.sendMessage('answer', answer, targetId);
  }

  sendIceCandidate(targetId: string, candidate: RTCIceCandidate): void {
    this.sendMessage('ice-candidate', candidate.toJSON(), targetId);
  }

  // Método mejorado de envío con validaciones
  private sendMessage(type: SignalType, data: any, targetId?: string): void {
    if (!this.socket) {
      console.warn('Socket no inicializado. Mensaje no enviado:', type);
      return;
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket no está conectado. Estado:', this.socket.readyState, 'Mensaje no enviado:', type);
      
      // Si está conectando, esperar un poco y reintentar
      if (this.socket.readyState === WebSocket.CONNECTING) {
        setTimeout(() => this.sendMessage(type, data, targetId), 100);
      }
      return;
    }

    const message: SignalMessage = {
      type,
      senderId: this.senderId,
      data,
      ...(targetId ? { targetId } : {})
    };

    try {
      this.socket.send(JSON.stringify(message));
      console.log('Mensaje enviado:', { type, targetId, dataType: typeof data });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  // Métodos de callback (mantener compatibilidad)
  onReceiveOffer(callback: (senderId: string, data: RTCSessionDescriptionInit) => void): void {
    this.onOffer = callback;
  }

  onReceiveAnswer(callback: (senderId: string, data: RTCSessionDescriptionInit) => void): void {
    this.onAnswer = callback;
  }

  onReceiveIceCandidate(callback: (senderId: string, data: RTCIceCandidateInit) => void): void {
    this.onIceCandidate = callback;
  }

  onReceiveUserJoined(callback: (userId: string) => void): void {
    this.onUserJoined = callback;
  }

  onReceiveUserLeft(callback: (userId: string) => void): void {
    this.onUserLeft = callback;
  }

  // ✅ NUEVO: Callback para participantes existentes
  onReceiveExistingParticipants(callback: (participants: string[]) => void): void {
    this.onExistingParticipants = callback;
  }

  // Métodos de utilidad
  getId(): string {
    return this.senderId;
  }

  getCurrentSala(): string | undefined {
    return this.currentSala;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Método mejorado de cierre
  close(): void {
    if (this.socket) {
      // Enviar mensaje de salida antes de cerrar
      if (this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage('user-left', { timestamp: new Date().toISOString() });
      }
      
      this.socket.close(1000, 'Usuario salió de la sala');
      this.socket = null as any;
    }
    
    this.connectionState$.next('disconnected');
    this.currentSala = undefined;
    this.reconnectAttempts = 0;
  }

  // ✅ NUEVO: Método para reiniciar conexión manualmente
  reconnect(): void {
    if (this.currentSala) {
      this.close();
      setTimeout(() => this.connect(this.currentSala!), 1000);
    }
  }

  // ✅ NUEVO: Método para limpiar callbacks
  clearCallbacks(): void {
    this.onOffer = undefined;
    this.onAnswer = undefined;
    this.onIceCandidate = undefined;
    this.onUserJoined = undefined;
    this.onUserLeft = undefined;
    this.onExistingParticipants = undefined;
  }

  private generarId(): string {
    // Generar ID más descriptivo
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `user_${timestamp}_${random}`;
  }

  // ✅ NUEVO: Método para debugging
  getDebugInfo(): any {
    return {
      senderId: this.senderId,
      currentSala: this.currentSala,
      connectionState: this.connectionState$.value,
      socketState: this.socket?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}
