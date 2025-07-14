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
import { PreguntaEvaluacionDTO } from '../../../../dtos/preguntaEvaluacion.dto';
import { PreguntaEvaluacionService } from '../../Services/pregunta-evaluacion.service';


@Component({
  selector: 'app-preguntas-evaluacion',
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
  templateUrl: './preguntas-evaluacion.component.html',
  styleUrl: './preguntas-evaluacion.component.scss'
})

export class PreguntasEvaluacionComponent implements OnInit {
  idEvaluacion!: number;
  preguntas: PreguntaEvaluacionDTO[] = [];
  preguntaDialog = false;
  pregunta: PreguntaEvaluacionDTO = this.nuevaPregunta();
  selectedPreguntas: PreguntaEvaluacionDTO[] = [];
  submitted = false;
  cols: any[] = [];
  exportColumns: any[] = [];

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private preguntaService: PreguntaEvaluacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idEvaluacion = Number(params.get('idEvaluacion'));
      this.loadPreguntas();
    });

    this.cols = [
      { field: 'cvePreguntaEvaluacion', header: 'ID' },
      { field: 'pregunta', header: 'Pregunta' },
      { field: 'opcion_a', header: 'A' },
      { field: 'opcion_b', header: 'B' },
      { field: 'opcion_c', header: 'C' },
      { field: 'opcion_d', header: 'D' },
      { field: 'respuesta_correcta', header: 'Respuesta' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadPreguntas() {
    this.preguntaService.listarPreguntasPorEvaluacion(this.idEvaluacion).subscribe({
      next: (data) => this.preguntas = data,
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las preguntas',
        life: 3000
      })
    });
  }

  nuevaPregunta(): PreguntaEvaluacionDTO {
    return {
      evaluacionId: this.idEvaluacion,
      pregunta: '',
      opcion_a: '',
      opcion_b: '',
      opcion_c: '',
      opcion_d: '',
      respuesta_correcta: ''
    };
  }

  openNew() {
    this.pregunta = this.nuevaPregunta();
    this.submitted = false;
    this.preguntaDialog = true;
  }

  editPregunta(pregunta: PreguntaEvaluacionDTO) {
    this.pregunta = { ...pregunta };
    this.preguntaDialog = true;
  }

  deleteSelectedPreguntas() {
    if (!this.selectedPreguntas.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar las preguntas seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        Promise.all(
          this.selectedPreguntas.map(p => this.preguntaService.eliminarPregunta(p.cvePreguntaEvaluacion!).toPromise())
        ).then(() => {
          this.loadPreguntas();
          this.selectedPreguntas = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Preguntas eliminadas',
            life: 3000
          });
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar todas las preguntas',
            life: 3000
          });
        });
      }
    });
  }

  deletePregunta(pregunta: PreguntaEvaluacionDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la pregunta "${pregunta.pregunta}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.preguntaService.eliminarPregunta(pregunta.cvePreguntaEvaluacion!).subscribe({
          next: () => {
            this.loadPreguntas();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Pregunta eliminada',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la pregunta',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.preguntaDialog = false;
    this.submitted = false;
  }

  savePregunta() {
    this.submitted = true;
    if (!this.pregunta.pregunta || !this.pregunta.pregunta.trim()) return;

    if (this.pregunta.cvePreguntaEvaluacion) {
      this.preguntaService.actualizarPregunta(this.pregunta.cvePreguntaEvaluacion, this.pregunta).subscribe({
        next: () => {
          this.loadPreguntas();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Pregunta actualizada',
            life: 3000
          });
          this.preguntaDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la pregunta',
            life: 3000
          });
        }
      });
    } else {
      this.preguntaService.crearPregunta(this.idEvaluacion, this.pregunta).subscribe({
        next: () => {
          this.loadPreguntas();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Pregunta creada',
            life: 3000
          });
          this.preguntaDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la pregunta',
            life: 3000
          });
        }
      });
    }
    this.pregunta = this.nuevaPregunta();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}