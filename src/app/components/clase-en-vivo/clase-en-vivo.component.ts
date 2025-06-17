import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClaseEnVivoDTO } from '../../../dtos/claseEnVivo.dto';
import { ActivatedRoute } from '@angular/router';
import { WebRTCService } from '../../Services/web-rtc.service';
import { ClaseEnVivoService } from '../../Services/clase-en-vivo.service';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EvaluacionDTO } from '../../../dtos/evaluacion.dto';
import { EvaluacionService } from '../../Services/evaluacion.service';
import { TokenInvitacionEmpresaDTO } from '../../../dtos/tokenInvitacionEmpresa.dto';
import { InvitacionService } from '../../Services/invitacion.service';

@Component({
  selector: 'app-clase-en-vivo',
  imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule],
  templateUrl: './clase-en-vivo.component.html',
  styleUrl: './clase-en-vivo.component.scss'
})
export class ClaseEnVivoComponent implements OnInit, OnDestroy {
@ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  claseId!: number;
  clase: ClaseEnVivoDTO = {};
  isVideoEnabled = true;
  isAudioEnabled = true;
  connectionState = 'disconnected';
  isInstructor = false; // Determinar según el rol del usuario

  constructor(
    private route: ActivatedRoute,
    private webrtcService: WebRTCService,
    private claseService: ClaseEnVivoService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.claseId = Number(params.get('claseId'));
      this.loadClase();
    });

    this.setupWebRTCSubscriptions();
  }

  ngOnDestroy() {
    this.webrtcService.disconnect();
  }

  private loadClase() {
    // Aquí cargarías los detalles de la clase
    // Por simplicidad, asumo que tienes un método para obtener una clase por ID
  }

  private setupWebRTCSubscriptions() {
    this.webrtcService.localStream$.subscribe(stream => {
      if (stream && this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
      }
    });

    this.webrtcService.remoteStream$.subscribe(stream => {
      if (stream && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });

    this.webrtcService.connectionState$.subscribe(state => {
      this.connectionState = state;
    });
  }

  async iniciarClase() {
    try {
      await this.webrtcService.initializeMedia();
      
      this.claseService.iniciarClase(this.claseId).subscribe({
        next: (roomId) => {
          this.webrtcService.connectToRoom(roomId);
          this.messageService.add({
            severity: 'success',
            summary: 'Clase iniciada',
            detail: 'La videoconferencia ha comenzado'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar la clase'
          });
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de acceso',
        detail: 'No se pudo acceder a la cámara o micrófono'
      });
    }
  }

  async unirseAClase() {
    try {
      await this.webrtcService.initializeMedia();
      const roomId = `clase-${this.claseId}`;
      this.webrtcService.connectToRoom(roomId);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de acceso',
        detail: 'No se pudo acceder a la cámara o micrófono'
      });
    }
  }

  toggleVideo() {
    this.webrtcService.toggleVideo();
    this.isVideoEnabled = !this.isVideoEnabled;
  }

  toggleAudio() {
    this.webrtcService.toggleAudio();
    this.isAudioEnabled = !this.isAudioEnabled;
  }

  finalizarClase() {
    this.claseService.finalizarClase(this.claseId).subscribe({
      next: () => {
        this.webrtcService.disconnect();
        this.messageService.add({
          severity: 'success',
          summary: 'Clase finalizada',
          detail: 'La videoconferencia ha terminado'
        });
      }
    });
  }

  salirDeClase() {
    this.webrtcService.disconnect();
  }
}