import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { CursoDTO } from '../../../dtos/cuso.dto';
import { CursoService } from '../../Services/curso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoDTO } from '../../../dtos/video.dto';
import { VideoService } from '../../Services/video.service';

@Component({
  selector: 'app-videos',
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
        ConfirmDialogModule
  ],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss'
})
export class VideosComponent implements OnInit {  
  idCurso!: number;
  videos: VideoDTO[] = [];
  videoDialog = false;
  video: VideoDTO = this.nuevoVideo();
  selectedVideos: VideoDTO[] = [];
  submitted = false;
  cols: any[] = [];
  exportColumns: any[] = [];
  
  // Nuevas propiedades para manejo de portadas
  portadaFile: File | null = null;
  portadaPreview: string | null = null;
  portadaUrls: { [key: number]: string } = {};

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadVideos();
    });

    this.cols = [
      { field: 'portada', header: 'Portada' },
      { field: 'titulo', header: 'Título' },
      { field: 'url', header: 'URL' },
      { field: 'duracion_minutos', header: 'Duración (min)' },
      { field: 'orden', header: 'Orden' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadVideos() {
    this.videoService.listarVideos(this.idCurso).subscribe({
      next: (data) => {
        this.videos = data;
        this.loadPortadas();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los vídeos',
        life: 3000
      })
    });
  }

  loadPortadas() {
    this.videos.forEach(video => {
      if (video.portada && video.cveVideo) {
        this.loadPortadaUrl(video.cveVideo, video.portada);
      }
    });
  }

  loadPortadaUrl(videoId: number, nombreArchivo: string) {
    if (this.portadaUrls[videoId]) {
      return;
    }

    this.videoService.obtenerPortada(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.portadaUrls[videoId] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        console.error('Error al cargar portada:', error);
        this.portadaUrls[videoId] = 'assets/images/no-video-thumbnail.png';
      }
    });
  }

  getPortadaUrl(video: VideoDTO): string {
    if (video.cveVideo && this.portadaUrls[video.cveVideo]) {
      return this.portadaUrls[video.cveVideo];
    }
    return 'assets/images/no-video-thumbnail.png';
  }

  nuevoVideo(): VideoDTO {
    return {
      cursoId: this.idCurso,
      titulo: '',
      url: '',
      duracion_minutos: 0,
      orden: 1,
      portada: ''
    };
  }

  openNew() {
    this.video = this.nuevoVideo();
    this.portadaFile = null;
    this.portadaPreview = null;
    this.submitted = false;
    this.videoDialog = true;
  }

  editVideo(video: VideoDTO) {
    this.video = { ...video };
    this.portadaFile = null;
    
    if (video.portada && video.cveVideo && this.portadaUrls[video.cveVideo]) {
      this.portadaPreview = this.portadaUrls[video.cveVideo];
    } else if (video.portada && video.cveVideo) {
      this.videoService.obtenerPortada(video.portada).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.portadaPreview = reader.result as string;
            this.portadaUrls[video.cveVideo!] = this.portadaPreview!;
          };
          reader.readAsDataURL(blob);
        },
        error: () => {
          this.portadaPreview = null;
        }
      });
    } else {
      this.portadaPreview = null;
    }
    
    this.videoDialog = true;
  }

  onPortadaChange(event: any) {
    const file = event.target.files[0];
    this.portadaFile = file ? file : null;
    if (this.portadaFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.portadaPreview = e.target.result;
      reader.readAsDataURL(this.portadaFile);
    } else {
      this.portadaPreview = null;
    }
  }

  saveVideo() {
    this.submitted = true;
    if (!this.video.titulo || !this.video.titulo.trim()) return;

    const afterSave = (savedVideo: VideoDTO) => {
      if (this.portadaFile && savedVideo.cveVideo) {
        this.videoService.subirPortada(savedVideo.cveVideo, this.portadaFile).subscribe({
          next: (updatedVideo) => {
            if (savedVideo.cveVideo) {
              delete this.portadaUrls[savedVideo.cveVideo];
            }
            this.loadVideos();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Video guardado y portada subida',
              life: 3000
            });
            this.videoDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'El video se guardó pero la portada no pudo subirse',
              life: 3000
            });
            this.videoDialog = false;
            this.loadVideos();
          }
        });
      } else {
        this.loadVideos();
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: 'Video guardado',
          life: 3000
        });
        this.videoDialog = false;
      }
      this.portadaFile = null;
      this.portadaPreview = null;
      this.video = this.nuevoVideo();
    };

    if (this.video.cveVideo) {
      this.videoService.actualizarVideo(this.idCurso, this.video).subscribe({
        next: (updated) => afterSave(updated),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el video',
            life: 3000
          });
        }
      });
    } else {
      this.videoService.crearVideo(this.idCurso, this.video).subscribe({
        next: (created) => afterSave(created),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el video',
            life: 3000
          });
        }
      });
    }
  }

  deleteVideo(video: VideoDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el vídeo "${video.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.videoService.eliminarVideo(video.cveVideo!).subscribe({
          next: () => {
            if (video.cveVideo) {
              delete this.portadaUrls[video.cveVideo];
            }
            this.loadVideos();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Vídeo eliminado',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el vídeo',
              life: 3000
            });
          }
        });
      }
    });
  }

  deleteSelectedVideos() {
    if (!this.selectedVideos.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar los vídeos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        Promise.all(
          this.selectedVideos.map(v => this.videoService.eliminarVideo(v.cveVideo!).toPromise())
        ).then(() => {
          // Limpiar caché de portadas
          this.selectedVideos.forEach(video => {
            if (video.cveVideo) {
              delete this.portadaUrls[video.cveVideo];
            }
          });
          this.loadVideos();
          this.selectedVideos = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Vídeos eliminados',
            life: 3000
          });
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar todos los vídeos',
            life: 3000
          });
        });
      }
    });
  }

  hideDialog() {
    this.videoDialog = false;
    this.submitted = false;
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Métodos para manejo de eventos de imagen
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/no-video-thumbnail.png';
    }
  }

  onImageHover(event: Event, isHover: boolean) {
    const target = event.target as HTMLImageElement;
    if (target) {
      if (isHover) {
        target.style.transform = 'scale(1.05)';
        target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      } else {
        target.style.transform = 'scale(1)';
        target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  clearPortadaCache() {
    Object.values(this.portadaUrls).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.portadaUrls = {};
  }

  ngOnDestroy() {
    this.clearPortadaCache();
  }
}
