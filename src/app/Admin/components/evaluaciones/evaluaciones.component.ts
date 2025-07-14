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
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluacionDTO } from '../../../../dtos/evaluacion.dto';
import { EvaluacionService } from '../../Services/evaluacion.service';


@Component({
  selector: 'app-evaluaciones',
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
  templateUrl: './evaluaciones.component.html',
  styleUrl: './evaluaciones.component.scss'
})
export class EvaluacionesComponent implements OnInit {
  idCurso!: number;
  evaluaciones: EvaluacionDTO[] = [];
  evaluacionDialog = false;
  evaluacion: EvaluacionDTO = this.nuevaEvaluacion();
  selectedEvaluaciones: EvaluacionDTO[] = [];
  submitted = false;
  cols: any[] = [];
  exportColumns: any[] = [];

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private evaluacionService: EvaluacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadEvaluaciones();
    });

    this.cols = [
      { field: 'cveEvaluacion', header: 'ID' },
      { field: 'titulo', header: 'Título' },
      { field: 'duracion_minutos', header: 'Duración (min)' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadEvaluaciones() {
    this.evaluacionService.listarEvaluacionesPorCurso(this.idCurso).subscribe({
      next: (data) => this.evaluaciones = data,
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las evaluaciones',
        life: 3000
      })
    });
  }

  nuevaEvaluacion(): EvaluacionDTO {
    return {
      cursoId: this.idCurso,
      titulo: '',
      duracion_minutos: 0
    };
  }

  openNew() {
    this.evaluacion = this.nuevaEvaluacion();
    this.submitted = false;
    this.evaluacionDialog = true;
  }

  editEvaluacion(evaluacion: EvaluacionDTO) {
    this.evaluacion = { ...evaluacion };
    this.evaluacionDialog = true;
  }

  deleteSelectedEvaluaciones() {
    if (!this.selectedEvaluaciones.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar las evaluaciones seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        Promise.all(
          this.selectedEvaluaciones.map(e => this.evaluacionService.eliminarEvaluacion(e.cveEvaluacion!).toPromise())
        ).then(() => {
          this.loadEvaluaciones();
          this.selectedEvaluaciones = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Evaluaciones eliminadas',
            life: 3000
          });
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar todas las evaluaciones',
            life: 3000
          });
        });
      }
    });
  }

  deleteEvaluacion(evaluacion: EvaluacionDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la evaluación "${evaluacion.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evaluacionService.eliminarEvaluacion(evaluacion.cveEvaluacion!).subscribe({
          next: () => {
            this.loadEvaluaciones();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Evaluación eliminada',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la evaluación',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.evaluacionDialog = false;
    this.submitted = false;
  }

  saveEvaluacion() {
    this.submitted = true;
    if (!this.evaluacion.titulo || !this.evaluacion.titulo.trim()) return;

    if (this.evaluacion.cveEvaluacion) {
      this.evaluacionService.actualizarEvaluacion(this.idCurso, this.evaluacion).subscribe({
        next: () => {
          this.loadEvaluaciones();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Evaluación actualizada',
            life: 3000
          });
          this.evaluacionDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la evaluación',
            life: 3000
          });
        }
      });
    } else {
      this.evaluacionService.crearEvaluacion(this.idCurso, this.evaluacion).subscribe({
        next: () => {
          this.loadEvaluaciones();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Evaluación creada',
            life: 3000
          });
          this.evaluacionDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la evaluación',
            life: 3000
          });
        }
      });
    }
    this.evaluacion = this.nuevaEvaluacion();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

    preguntas(idEvaluacion: number) {
     this.router.navigate(['/cursos/evaluaciones/preguntas/' + idEvaluacion]);
  }
}