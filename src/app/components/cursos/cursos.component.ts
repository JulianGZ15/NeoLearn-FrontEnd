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
import { Router } from '@angular/router';


@Component({
  selector: 'app-cursos',
    standalone: true,
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
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss'
})

export class CursosComponent implements OnInit {

  cursoDialog = false;
  cursos: CursoDTO[] = [];
  curso: CursoDTO = this.nuevoCurso();
  selectedCursos: CursoDTO[] = [];
  submitted = false;
  statuses: any[] = [];
  cols: any[] = [];
  exportColumns: any[] = [];
  portadaFile: File | null = null;
  portadaPreview: string | null = null;
  portadaUrls: { [key: number]: string } = {};

  @ViewChild('dt') dt!: Table;

  constructor(
    private cursoService: CursoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCursos();

    this.statuses = [
      { label: 'Publicado', value: 'PUBLICADO' },
      { label: 'Inactivo', value: 'INACTIVO' },
      { label: 'Borrado', value: 'BORRADO' }
    ];

    this.cols = [
      { field: 'cveCurso', header: 'ID', customExportHeader: 'Curso ID' },
      { field: 'portada', header: 'Portada' },
      { field: 'titulo', header: 'Título' },
      { field: 'precio', header: 'Precio' },
      { field: 'publico_objetivo', header: 'Público Objetivo' },
      { field: 'fecha_publicacion', header: 'Fecha Publicación' },
      { field: 'estado', header: 'Estado' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadCursos() {
    this.cursoService.listarCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        // Cargar las portadas después de obtener los cursos
        this.loadPortadas();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los cursos',
        life: 3000
      })
    });
  }

  loadPortadas() {
    this.cursos.forEach(curso => {
      if (curso.portada && curso.cveCurso) {
        this.loadPortadaUrl(curso.cveCurso, curso.portada);
      }
    });
  }

  loadPortadaUrl(cursoId: number, nombreArchivo: string) {
    if (this.portadaUrls[cursoId]) {
      return; // Ya está cargada
    }

    this.cursoService.obtenerPortada(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.portadaUrls[cursoId] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        console.error('Error al cargar portada:', error);
        // Opcional: establecer una imagen por defecto
        this.portadaUrls[cursoId] = 'assets/images/no-image.png';
      }
    });
  }

  getPortadaUrl(curso: CursoDTO): string {
    if (curso.cveCurso && this.portadaUrls[curso.cveCurso]) {
      return this.portadaUrls[curso.cveCurso];
    }
    return 'assets/images/no-image.png'; // Imagen por defecto
  }

  nuevoCurso(): CursoDTO {
    return {
      titulo: '',
      descripcion: '',
      precio: 0,
      es_gratis: false,
      publico_objetivo: '',
      fecha_publicacion: '',
      estado: 'PUBLICADO',
      portada: ''
    };
  }

  openNew() {
    this.curso = this.nuevoCurso();
    this.portadaFile = null;
    this.portadaPreview = null;
    this.submitted = false;
    this.cursoDialog = true;
  }

  editCurso(curso: CursoDTO) {
    this.curso = { ...curso };
    this.portadaFile = null;
    
    // Si el curso tiene portada, cargarla como preview
    if (curso.portada && curso.cveCurso && this.portadaUrls[curso.cveCurso]) {
      this.portadaPreview = this.portadaUrls[curso.cveCurso];
    } else if (curso.portada && curso.cveCurso) {
      // Cargar la portada si no está en caché
      this.cursoService.obtenerPortada(curso.portada).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.portadaPreview = reader.result as string;
            this.portadaUrls[curso.cveCurso!] = this.portadaPreview!;
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
    
    this.cursoDialog = true;
  }

  deleteSelectedCursos() {
    if (!this.selectedCursos.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar los cursos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedCursos.map(c => c.cveCurso);
        // Eliminar uno por uno del backend
        Promise.all(ids.map(id => this.cursoService.eliminarCurso(id!).toPromise()))
          .then(() => {
            this.loadCursos();
            this.selectedCursos = [];
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Cursos eliminados',
              life: 3000
            });
          })
          .catch(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron eliminar todos los cursos',
              life: 3000
            });
          });
      }
    });
  }

 deleteCurso(curso: CursoDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el curso "${curso.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cursoService.eliminarCurso(curso.cveCurso!).subscribe({
          next: () => {
            // Limpiar caché de la portada
            if (curso.cveCurso) {
              delete this.portadaUrls[curso.cveCurso];
            }
            this.loadCursos();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Curso eliminado',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el curso',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.cursoDialog = false;
    this.submitted = false;
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

  saveCurso() {
    this.submitted = true;
    if (!this.curso.titulo || !this.curso.titulo.trim()) return;

    const afterSave = (savedCurso: CursoDTO) => {
      if (this.portadaFile && savedCurso.cveCurso) {
        this.cursoService.subirPortada(savedCurso.cveCurso, this.portadaFile).subscribe({
          next: (updatedCurso) => {
            // Limpiar caché de la portada para forzar recarga
            if (savedCurso.cveCurso) {
              delete this.portadaUrls[savedCurso.cveCurso];
            }
            this.loadCursos();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Curso guardado y portada subida',
              life: 3000
            });
            this.cursoDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'El curso se guardó pero la portada no pudo subirse',
              life: 3000
            });
            this.cursoDialog = false;
            this.loadCursos();
          }
        });
      } else {
        this.loadCursos();
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: 'Curso guardado',
          life: 3000
        });
        this.cursoDialog = false;
      }
      this.portadaFile = null;
      this.portadaPreview = null;
      this.curso = this.nuevoCurso();
    };

    if (this.curso.cveCurso) {
      this.cursoService.actualizarCurso(this.curso.cveCurso, this.curso).subscribe({
        next: (updated) => afterSave(updated),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el curso',
            life: 3000
          });
        }
      });
    } else {
      this.cursoService.crearCurso(this.curso).subscribe({
        next: (created) => afterSave(created),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el curso',
            life: 3000
          });
        }
      });
    }
  }

  

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getSeverity(status: string) {
    switch (status) {
      case 'PUBLICADO':
        return 'success';
      case 'INACTIVO':
        return 'warn';
      case 'BORRADO':
        return 'danger';
      default:
        return 'info';
    }
  }

  videos(idCurso: number) {
     this.router.navigate(['/cursos/videos/' + idCurso]);
  }

  // Método para manejar errores de imagen
onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = 'assets/images/no-image.png';
  }
}

// Método para manejar hover de imagen
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

}