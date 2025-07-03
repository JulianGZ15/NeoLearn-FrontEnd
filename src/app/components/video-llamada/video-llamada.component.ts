import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ClaseEnVivoDTO } from '../../../dtos/claseEnVivo.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalingService } from '../../Services/signaling.service';
import { ClaseEnVivoService } from '../../Services/clase-en-vivo.service';
import { MessageService } from 'primeng/api';
import { EstadoClase } from '../../../dtos/estadoClase.enum';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Toolbar } from 'primeng/toolbar';
import { Chip } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { ChatComponent } from "../chat/chat.component";
import { LayoutService } from '../../layout/service/layout.service';


interface Participante {
  id: string;
  nombre?: string;
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

@Component({
  selector: 'app-video-llamada',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    AvatarModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule,
    PanelModule,
    DividerModule,
    InputTextModule,
    ScrollPanelModule,
    OverlayPanelModule,
    Toolbar,
    Chip,
    ChatComponent
],
  templateUrl: './video-llamada.component.html',
  styleUrl: './video-llamada.component.scss'
})
export class VideoLlamadaComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;

  // Datos de la clase
  claseId!: number;
  clase?: ClaseEnVivoDTO;
  codigoSala!: string;

  // Estado de la llamada
  localStream?: MediaStream;
  participantes = new Map<string, Participante>();
  isConnected = false;
  isAudioEnabled = true;
  isVideoEnabled = true;
  isScreenSharing = false;

  // UI State
  loading = true;
  error?: string;
  showParticipants = true;
  showChat = false;

    // Chat
  mostrarChat = false;
  esInstructor = false;

  // Configuración WebRTC
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalingService: SignalingService,
    private claseService: ClaseEnVivoService,
    private messageService: MessageService,
    private layoutService: LayoutService
  ) {}

ngOnInit(): void {
  this.route.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(async params => {
      this.claseId = +params['idClase'];
      await this.cargarClase();

      this.layoutService.onMenuToggle(); // este sí puede quedar aquí
    });
}

ngAfterViewInit(): void {
  this.inicializarVideoCall(); // ✅ ejecuta aquí donde ya está disponible el videoRef
}


  ngOnDestroy(): void {
    this.desconectar();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async cargarClase(): Promise<void> {
    try {
      const clase = await this.claseService.obtenerDetalle(this.claseId).toPromise();
      if (!clase) {
        throw new Error('Clase no encontrada');
      }

      this.clase = clase;
      this.codigoSala = clase.codigoSala!;

      // Verificar que la clase esté en vivo
      if (clase.estado !== EstadoClase.EN_VIVO) {
        throw new Error('La clase no está actualmente en vivo');
      }

    } catch (error: any) {
      this.error = error.message || 'Error al cargar la clase';
      this.loading = false;
    }
  }

  public async inicializarVideoCall(): Promise<void> {
    try {
      // Configurar callbacks del signaling service
      this.configurarSignalingCallbacks();

      // Obtener media local
      await this.obtenerMediaLocal();

      // Conectar al WebSocket
      this.signalingService.connect(this.codigoSala);

      // Monitorear estado de conexión
      this.signalingService.getConnectionState()
        .pipe(takeUntil(this.destroy$))
        .subscribe(state => {
          this.isConnected = state === 'connected';
          if (state === 'connected') {
            this.loading = false;
          }
        });

    } catch (error: any) {
      this.error = error.message || 'Error al inicializar la videollamada';
      this.loading = false;
    }
  }

  private configurarSignalingCallbacks(): void {
    // Usuario se unió
// Usuario se unió - INICIAR PROCESO WEBRTC
  this.signalingService.onReceiveUserJoined((userId) => {
    console.log('🟢 Usuario se unió:', userId);
    this.agregarParticipante(userId);
    
    // ✅ IMPORTANTE: Iniciar oferta inmediatamente
    setTimeout(() => {
      this.iniciarOferta(userId);
    }, 1000); // Pequeño delay para asegurar que la conexión esté lista
  });
    // Usuario se fue
    this.signalingService.onReceiveUserLeft((userId) => {
      console.log('Usuario se fue:', userId);
      this.removerParticipante(userId);
    });

// Participantes existentes - INICIAR OFERTAS A TODOS
  this.signalingService.onReceiveExistingParticipants?.((participants) => {
    console.log('👥 Participantes existentes:', participants);
    participants.forEach(participantId => {
      this.agregarParticipante(participantId);
      
      // ✅ IMPORTANTE: Iniciar oferta a cada participante existente
      setTimeout(() => {
        this.iniciarOferta(participantId);
      }, 1000);
    });
  });

    // Oferta recibida
    this.signalingService.onReceiveOffer(async (senderId, offer) => {
      console.log('Oferta recibida de:', senderId);
      await this.manejarOferta(senderId, offer);
    });

    // Respuesta recibida
    this.signalingService.onReceiveAnswer(async (senderId, answer) => {
      console.log('Respuesta recibida de:', senderId);
      await this.manejarRespuesta(senderId, answer);
    });

    // ICE candidate recibido
    this.signalingService.onReceiveIceCandidate(async (senderId, candidate) => {
      console.log('ICE candidate recibido de:', senderId);
      await this.manejarIceCandidate(senderId, candidate);
    });
  }

 private async obtenerMediaLocal(): Promise<void> {
  try {
    console.log('🎥 Obteniendo media local...');
    
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });

    console.log('✅ Stream local obtenido:', this.localStream.getTracks().map(t => t.kind));

    // Configurar video local
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = this.localStream;
    }

    // ✅ IMPORTANTE: Si ya hay participantes, agregar tracks a sus conexiones
    this.participantes.forEach((participante, participantId) => {
      if (participante.peerConnection) {
        console.log('🔄 Agregando tracks locales a conexión existente:', participantId);
        this.localStream!.getTracks().forEach(track => {
          participante.peerConnection!.addTrack(track, this.localStream!);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo media local:', error);
    throw new Error('No se pudo acceder a la cámara y micrófono');
  }
}

  
  private agregarParticipante(participantId: string): void {
    if (!this.participantes.has(participantId)) {
      const participante: Participante = {
        id: participantId,
        isAudioEnabled: true,
        isVideoEnabled: true
      };

      this.participantes.set(participantId, participante);
      this.crearPeerConnection(participantId);
    }
  }

  private removerParticipante(participantId: string): void {
    const participante = this.participantes.get(participantId);
    if (participante) {
      participante.peerConnection?.close();
      participante.stream?.getTracks().forEach(track => track.stop());
      this.participantes.delete(participantId);
    }
  }
  
private crearPeerConnection(participantId: string): RTCPeerConnection {
  console.log('🔗 Creando peer connection para:', participantId);
  
  const pc = new RTCPeerConnection(this.rtcConfiguration);
  const participante = this.participantes.get(participantId)!;
  participante.peerConnection = pc;

  // ✅ IMPORTANTE: Agregar tracks locales INMEDIATAMENTE
  if (this.localStream) {
    console.log('📡 Agregando tracks locales para:', participantId);
    this.localStream.getTracks().forEach(track => {
      console.log('🎵 Agregando track:', track.kind, 'a', participantId);
      pc.addTrack(track, this.localStream!);
    });
  } else {
    console.warn('⚠️ No hay stream local al crear peer connection para:', participantId);
  }

  // Manejar ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('🧊 Enviando ICE candidate a:', participantId);
      this.signalingService.sendIceCandidate(participantId, event.candidate);
    } else {
      console.log('🧊 ICE gathering completado para:', participantId);
    }
  };

  // ✅ CRÍTICO: Manejar stream remoto correctamente
  pc.ontrack = (event) => {
    console.log('📺 Track remoto recibido de:', participantId, event);
    
    if (event.streams && event.streams.length > 0) {
      const remoteStream = event.streams[0];
      console.log('🎥 Stream remoto asignado a:', participantId);
      participante.stream = remoteStream;
      
      // Forzar detección de cambios en Angular
      setTimeout(() => {
        console.log('🔄 Forzando actualización de UI para:', participantId);
      }, 100);
    }
  };

  // ✅ IMPORTANTE: Monitorear estados de conexión
  pc.onconnectionstatechange = () => {
    console.log(`🔌 Estado de conexión con ${participantId}:`, pc.connectionState);
    
    if (pc.connectionState === 'connected') {
      console.log('✅ Conexión establecida con:', participantId);
    } else if (pc.connectionState === 'failed') {
      console.warn('❌ Conexión falló con:', participantId);
      this.reintentarConexion(participantId);
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log(`🧊 Estado ICE con ${participantId}:`, pc.iceConnectionState);
  };

  return pc;
}


private async manejarOferta(senderId: string, offer: RTCSessionDescriptionInit): Promise<void> {
  try {
    console.log('📨 Procesando oferta de:', senderId);
    
    let participante = this.participantes.get(senderId);
    if (!participante) {
      console.log('👤 Creando participante para oferta de:', senderId);
      this.agregarParticipante(senderId);
      participante = this.participantes.get(senderId)!;
    }

    const pc = participante.peerConnection!;
    
    console.log('🔧 Configurando remote description para:', senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    console.log('📝 Creando respuesta para:', senderId);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.signalingService.sendAnswer(senderId, answer);
    console.log('✅ Respuesta enviada a:', senderId);

  } catch (error) {
    console.error('❌ Error manejando oferta de', senderId, ':', error);
  }
}

private async manejarRespuesta(senderId: string, answer: RTCSessionDescriptionInit): Promise<void> {
  try {
    console.log('📨 Procesando respuesta de:', senderId);
    
    const participante = this.participantes.get(senderId);
    if (participante?.peerConnection) {
      await participante.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Respuesta procesada de:', senderId);
    } else {
      console.warn('❌ No hay peer connection para respuesta de:', senderId);
    }
  } catch (error) {
    console.error('❌ Error manejando respuesta de', senderId, ':', error);
  }
}


  private async manejarIceCandidate(senderId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const participante = this.participantes.get(senderId);
      if (participante?.peerConnection && participante.peerConnection.remoteDescription) {
        await participante.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error manejando ICE candidate:', error);
    }
  }

  private actualizarVideoRemoto(participantId: string, stream: MediaStream): void {
    // Esto se manejará en el template con *ngFor
    // El stream ya está asignado al participante
  }

  private async reintentarConexion(participantId: string): Promise<void> {
    console.log('Reintentando conexión con:', participantId);
    
    this.removerParticipante(participantId);
    
    setTimeout(() => {
      this.agregarParticipante(participantId);
      this.iniciarOferta(participantId);
    }, 2000);
  }

// ✅ NUEVO: Método para iniciar ofertas automáticamente
private async iniciarOferta(participantId: string): Promise<void> {
  try {
    console.log('🚀 Iniciando oferta a:', participantId);
    
    const participante = this.participantes.get(participantId);
    if (!participante?.peerConnection) {
      console.warn('❌ No hay peer connection para:', participantId);
      return;
    }

    const pc = participante.peerConnection;
    
    // Verificar que tengamos tracks locales
    if (!this.localStream) {
      console.warn('❌ No hay stream local disponible');
      return;
    }

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    await pc.setLocalDescription(offer);
    this.signalingService.sendOffer(participantId, offer);
    
    console.log('✅ Oferta enviada a:', participantId);

  } catch (error) {
    console.error('❌ Error creando oferta para', participantId, ':', error);
  }
}

  // Métodos públicos para controles
  toggleAudio(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
      }
    }
  }

  
  async compartirPantalla(): Promise<void> {
    try {
      if (!this.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Reemplazar track de video en todas las conexiones
        const videoTrack = screenStream.getVideoTracks()[0];
        
        this.participantes.forEach((participante) => {
          const sender = participante.peerConnection?.getSenders()
            .find(s => s.track && s.track.kind === 'video');
          
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Actualizar video local
        if (this.localVideoRef?.nativeElement) {
          this.localVideoRef.nativeElement.srcObject = screenStream;
        }

        this.isScreenSharing = true;

        // Detectar cuando se deja de compartir
        videoTrack.onended = () => {
          this.detenerCompartirPantalla();
        };

      } else {
        this.detenerCompartirPantalla();
      }
    } catch (error) {
      console.error('Error compartiendo pantalla:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo compartir la pantalla'
      });
    }
  }

  private async detenerCompartirPantalla(): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      // Restaurar cámara en todas las conexiones
      this.participantes.forEach((participante) => {
        const sender = participante.peerConnection?.getSenders()
          .find(s => s.track && s.track.kind === 'video');
        
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Restaurar video local
      if (this.localVideoRef?.nativeElement) {
        this.localVideoRef.nativeElement.srcObject = this.localStream;
      }
    }

    this.isScreenSharing = false;
  }

  salirDeLlamada(): void {
    this.desconectar();
    this.router.navigate(['/clases-en-vivo', this.clase?.cursoId]);
  }

  private desconectar(): void {
    // Cerrar todas las conexiones
    this.participantes.forEach(participante => {
      participante.peerConnection?.close();
      participante.stream?.getTracks().forEach(track => track.stop());
    });

    // Detener stream local
    this.localStream?.getTracks().forEach(track => track.stop());

    // Cerrar WebSocket
    this.signalingService.close();

    this.participantes.clear();
    this.isConnected = false;
  }

  // Getters para el template
  get participantesArray(): Participante[] {
    return Array.from(this.participantes.values());
  }

  get totalParticipantes(): number {
    return this.participantes.size + 1; // +1 por el usuario local
  }

  // Agregar estos métodos al componente VideoCallComponent

trackByParticipante(index: number, participante: Participante): string {
  return participante.id;
}

getParticipantName(participantId: string): string {
  // Aquí puedes implementar lógica para obtener nombres reales
  return participantId.length > 12 ? 
    participantId.substring(0, 12) + '...' : 
    participantId;
}

getParticipantInitials(participantId: string): string {
  const name = this.getParticipantName(participantId);
  return name.substring(0, 2).toUpperCase();
}

getConnectionStatus(participante: Participante): string {
  if (!participante.peerConnection) return 'Desconectado';
  
  const state = participante.peerConnection.connectionState;
  const statusMap = {
    'connected': 'Conectado',
    'connecting': 'Conectando',
    'disconnected': 'Desconectado',
    'failed': 'Error',
    'closed': 'Cerrado'
  };
  
  return statusMap[state as keyof typeof statusMap] || 'Desconocido';
}

getConnectionSeverity(participante: Participante): string {
  const status = this.getConnectionStatus(participante);
  const severityMap = {
    'Conectado': 'success',
    'Conectando': 'warning',
    'Desconectado': 'danger',
    'Error': 'danger',
    'Cerrado': 'secondary'
  };
  
  return severityMap[status as keyof typeof severityMap] || 'secondary';
}

 // Método para alternar chat
  toggleChat(): void {
    this.mostrarChat = !this.mostrarChat;
  }


}