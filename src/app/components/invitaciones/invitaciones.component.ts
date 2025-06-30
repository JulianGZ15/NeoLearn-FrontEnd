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
import { EvaluacionDTO } from '../../../dtos/evaluacion.dto';
import { EvaluacionService } from '../../Services/evaluacion.service';
import { TokenInvitacionEmpresaDTO } from '../../../dtos/tokenInvitacionEmpresa.dto';
import { InvitacionService } from '../../Services/invitacion.service';


@Component({
  selector: 'app-invitaciones',
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
  templateUrl: './invitaciones.component.html',
  styleUrl: './invitaciones.component.scss'
})
export class InvitacionesComponent implements OnInit {
  invitaciones: TokenInvitacionEmpresaDTO[] = [];
  invitacionesFiltradas: TokenInvitacionEmpresaDTO[] = [];
  cols: any[] = [];
  exportColumns: any[] = [];
  generando = false;
  filtroEstatus: string = 'todos';

  @ViewChild('dt') dt!: Table;

  constructor(
    private invitacionService: InvitacionService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'token', header: 'Token' },
      { field: 'fechaCreacion', header: 'Fecha de Creación' },
      { field: 'fechaExpiracion', header: 'Fecha de Expiración' },
      { field: 'estatus', header: 'Estatus' }
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    this.loadInvitaciones();
  }

  onGlobalFilter(table: any, event: Event) {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }

  loadInvitaciones() {
    this.invitacionService.obtenerInvitacionesPorEmpresa().subscribe({
      next: (data) => {
        this.invitaciones = data.map(inv => ({
          ...inv,
          estatus: inv.usado ? 'Usado' : 'Activo'
        }));

        this.aplicarFiltroEstatus();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las invitaciones',
        life: 3000
      })
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  generarInvitacion() {
this.generando = true;
  this.invitacionService.generarInvitacion().subscribe({
    next: (response) => {
      const token = response;
        this.copiarAlPortapapeles(this.generarUrl(token));
        this.messageService.add({
          severity: 'success',
          summary: 'Invitación generada',
          detail: 'El enlace ha sido generado y copiado.',
          life: 3000
        });
        setTimeout(() => {
          this.loadInvitaciones();
          this.generando = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error al generar invitación:', error); // Para debugging
        this.generando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar la invitación',
          life: 3000
        });
      }
    });
  }

  generarUrl(token: string): string {
    return `${window.location.origin}/registro-empresa?token=${encodeURIComponent(token)}`;
  }

  copiarAlPortapapeles(texto: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Enlace copiado',
          detail: 'El enlace de invitación ha sido copiado al portapapeles.',
          life: 3000
        });
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.messageService.add({
        severity: 'info',
        summary: 'Enlace copiado',
        detail: 'El enlace de invitación ha sido copiado al portapapeles.',
        life: 3000
      });
    }
  }

  copiarToken(token: string) {
    this.copiarAlPortapapeles(this.generarUrl(token));
  }

  aplicarFiltroEstatus() {
    if (this.filtroEstatus === 'activo') {
      this.invitacionesFiltradas = this.invitaciones.filter(i => !i.usado); // ✅ Lógica corregida
    } else if (this.filtroEstatus === 'inactivo') {
      this.invitacionesFiltradas = this.invitaciones.filter(i => i.usado); // ✅ Lógica corregida
    } else {
      this.invitacionesFiltradas = [...this.invitaciones];
    }
  }

}