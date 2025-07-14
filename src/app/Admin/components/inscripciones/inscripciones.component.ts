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
import { CursoDTO } from '../../../../dtos/cuso.dto';
import { CursoService } from '../../Services/curso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InscripcionDTO } from '../../../../dtos/inscripcion.dto';
import { InscripcionService } from '../../Services/inscripcion.service';
import { UsuarioService } from '../../Services/usuario.service';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';

@Component({
  selector: 'app-inscripciones',
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
  templateUrl: './inscripciones.component.html',
  styleUrl: './inscripciones.component.scss'
})
export class InscripcionesComponent implements OnInit {
  idCurso!: number;
  inscripciones: (InscripcionDTO & { usuarioNombre?: string })[] = [];
  inscripcionDialog = false;
  inscripcion: InscripcionDTO = this.nuevaInscripcion();
  selectedInscripciones: InscripcionDTO[] = [];
  submitted = false;
  cols: any[] = [];
  exportColumns: any[] = [];
  usuarioCache: { [id: number]: string } = {};

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private inscripcionService: InscripcionService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadInscripciones();
    });

    this.cols = [
      { field: 'cveInscripcion', header: 'ID' },
      { field: 'usuarioNombre', header: 'Usuario' },
      { field: 'fecha_inscripcion', header: 'Fecha' },
      { field: 'precio_pagado', header: 'Precio Pagado' },
      { field: 'metodo_pago', header: 'Método de Pago' },
      { field: 'estado', header: 'Estado' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadInscripciones() {
    this.inscripcionService.listarInscripcionesPorCurso(this.idCurso).subscribe({
      next: (data) => {
        this.inscripciones = data.map(insc => ({ ...insc }));
        this.cargarNombresUsuarios();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las inscripciones',
        life: 3000
      })
    });
  }

  cargarNombresUsuarios() {
    const idsUnicos = Array.from(
      new Set(this.inscripciones.map(i => i.usuarioId).filter(id => !!id))
    ) as number[];

    idsUnicos.forEach(id => {
      if (this.usuarioCache[id]) {
        // Ya lo tenemos en caché
        this.inscripciones.filter(i => i.usuarioId === id).forEach(i => i.usuarioNombre = this.usuarioCache[id]);
      } else {
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
          next: (usuario: UsuarioDTO) => {
            this.usuarioCache[id] = usuario.nombre || '';
            this.inscripciones.filter(i => i.usuarioId === id).forEach(i => i.usuarioNombre = usuario.nombre || '');
          },
          error: () => {
            this.usuarioCache[id] = 'Desconocido';
            this.inscripciones.filter(i => i.usuarioId === id).forEach(i => i.usuarioNombre = 'Desconocido');
          }
        });
      }
    });
  }

  nuevaInscripcion(): InscripcionDTO {
    return {
      cursoId: this.idCurso,
      usuarioId: undefined,
      fecha_inscripcion: '',
      precio_pagado: 0,
      metodo_pago: '',
      estado: 'ACTIVA'
    };
  }

  openNew() {
    this.inscripcion = this.nuevaInscripcion();
    this.submitted = false;
    this.inscripcionDialog = true;
  }

  editInscripcion(inscripcion: InscripcionDTO) {
    this.inscripcion = { ...inscripcion };
    this.inscripcionDialog = true;
  }

  deleteSelectedInscripciones() {
    if (!this.selectedInscripciones.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar las inscripciones seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        Promise.all(
          this.selectedInscripciones.map(i => this.inscripcionService.eliminarInscripcion(i.cveInscripcion!).toPromise())
        ).then(() => {
          this.loadInscripciones();
          this.selectedInscripciones = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Inscripciones eliminadas',
            life: 3000
          });
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar todas las inscripciones',
            life: 3000
          });
        });
      }
    });
  }

  deleteInscripcion(inscripcion: InscripcionDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la inscripción ID ${inscripcion.cveInscripcion}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.inscripcionService.eliminarInscripcion(inscripcion.cveInscripcion!).subscribe({
          next: () => {
            this.loadInscripciones();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Inscripción eliminada',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la inscripción',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.inscripcionDialog = false;
    this.submitted = false;
  }

  saveInscripcion() {
    this.submitted = true;
    if (!this.inscripcion.usuarioId) return;

    if (this.inscripcion.cveInscripcion) {
      this.inscripcionService.actualizarInscripcion(this.inscripcion, this.idCurso).subscribe({
        next: () => {
          this.loadInscripciones();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Inscripción actualizada',
            life: 3000
          });
          this.inscripcionDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la inscripción',
            life: 3000
          });
        }
      });
    } else {
      this.inscripcionService.crearInscripcion(this.inscripcion, this.idCurso).subscribe({
        next: () => {
          this.loadInscripciones();
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Inscripción creada',
            life: 3000
          });
          this.inscripcionDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la inscripción',
            life: 3000
          });
        }
      });
    }
    this.inscripcion = this.nuevaInscripcion();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getSeverity(estado: string) {
    switch (estado) {
      case 'ACTIVA':
        return 'success';
      case 'CANCELADA':
        return 'danger';
      case 'PENDIENTE':
        return 'warn';
      default:
        return 'info';
    }
  }
}