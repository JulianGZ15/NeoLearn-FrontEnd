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

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    // Obtiene el idCurso de la ruta
    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadVideos();
    });

    this.cols = [
      { field: 'titulo', header: 'Título' },
      { field: 'url', header: 'URL' },
      { field: 'duracion_minutos', header: 'Duración (min)' },
      { field: 'orden', header: 'Orden' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadVideos() {
    this.videoService.listarVideos(this.idCurso).subscribe({
      next: (data) => this.videos = data,
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los vídeos',
        life: 3000
      })
    });
  }

  nuevoVideo(): VideoDTO {
    return {
      cursoId: this.idCurso,
      titulo: '',
      url: '',
      duracion_minutos: 0,
      orden: 1
    };
  }

  openNew() {
    this.video = this.nuevoVideo();
    this.submitted = false;
    this.videoDialog = true;
  }

  editVideo(video: VideoDTO) {
    this.video = { ...video };
    this.videoDialog = true;
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

  deleteVideo(video: VideoDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el vídeo "${video.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.videoService.eliminarVideo(video.cveVideo!).subscribe({
          next: () => {
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

  hideDialog() {
    this.videoDialog = false;
    this.submitted = false;
  }

  saveVideo() {
    this.submitted = true;
    if (!this.video.titulo || !this.video.titulo.trim()) return;

    if (this.video.cveVideo) {
      // Actualizar
      this.videoService.actualizarVideo(this.idCurso, this.video).subscribe({
        next: () => {
          this.loadVideos();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Vídeo actualizado',
            life: 3000
          });
          this.videoDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el vídeo',
            life: 3000
          });
        }
      });
    } else {
      // Crear
      this.videoService.crearVideo(this.idCurso, this.video).subscribe({
        next: () => {
          this.loadVideos();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Vídeo creado',
            life: 3000
          });
          this.videoDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el vídeo',
            life: 3000
          });
        }
      });
    }
    this.video = this.nuevoVideo();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}