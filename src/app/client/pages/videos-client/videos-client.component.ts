import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VideoDTO } from '../../../../dtos/video.dto';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { VideosClientService } from '../../services/videos-client.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-videos-client',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    ProgressBar,
    Button,
    Dialog,
    Tag,
    Toast,

  ],
  templateUrl: './videos-client.component.html',
  styleUrl: './videos-client.component.scss'
})
export class VideosClientComponent implements OnInit, OnDestroy {
 cveCurso!: number;
  
  videos: VideoDTO[] = [];
  selectedVideo: VideoDTO | null = null;
  loading = false;
  videoPortadas: Map<string, string> = new Map();
  showDialog: boolean = false;


  
  private destroy$ = new Subject<void>();

  constructor(
    private videosService: VideosClientService,
    private messageService: MessageService,
        private route: ActivatedRoute,

  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.cveCurso = Number(params.get('id'));
      this.cargarVideos();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar URLs de objetos para evitar memory leaks
    this.videoPortadas.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

  cargarVideos() {
    this.loading = true;
    
    this.videosService.listarVideos(this.cveCurso)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (videos) => {
          this.videos = videos;
          this.cargarPortadas();
        },
        error: (error) => {
          console.error('Error al cargar videos:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los videos del curso'
          });
        }
      });
  }

  private cargarPortadas() {
    this.videos.forEach(video => {
      if (video.portada) {
        this.videosService.obtenerPortada(video.portada)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              this.videoPortadas.set(video.portada!, url);
            },
            error: (error) => {
              console.error(`Error al cargar portada para video ${video.titulo}:`, error);
            }
          });
      }
    });
  }

seleccionarVideo(video: any) {
  this.selectedVideo = video;
  this.showDialog = true;
}

  obtenerPortadaUrl(nombrePortada: string): string {
    return this.videoPortadas.get(nombrePortada) || 'assets/images/video-placeholder.jpg';
  }

  formatearDuracion(duracion: number): string {
    const minutos = Math.floor(duracion / 60);
    const segundos = duracion % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  obtenerIconoEstado(completado: boolean): string {
    return completado ? 'pi pi-check-circle' : 'pi pi-play-circle';
  }

  obtenerClaseEstado(completado: boolean): string {
    return completado ? 'text-green-500' : 'text-primary-500';
  }
}