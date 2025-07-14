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
import { PreguntaDTO } from '../../../../dtos/pregunta.dto';
import { RespuestaDTO } from '../../../../dtos/respuesta.dto';
import { PreguntaService } from '../../Services/pregunta.service';
import { RespuestaService } from '../../Services/respuesta.service';
import { UsuarioService } from '../../Services/usuario.service';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';
import { catchError, forkJoin, of } from 'rxjs';



@Component({
  selector: 'app-preguntas-curso',
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
  templateUrl: './preguntas-curso.component.html',
  styleUrl: './preguntas-curso.component.scss'
})
export class PreguntasCursoComponent implements OnInit {
  idCurso!: number;
  preguntas: (PreguntaDTO & { usuarioNombre?: string, respuestaContenido?: string })[] = [];
  usuarioCache: { [id: number]: string } = {};
  cols: any[] = [];
  exportColumns: any[] = [];
  respuestaDialog = false;
  preguntaSeleccionada?: PreguntaDTO;
  respuesta: RespuestaDTO = this.nuevaRespuesta();
  submitted = false;

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService,
    private usuarioService: UsuarioService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadPreguntas();
    });

    this.cols = [
      { field: 'contenido', header: 'Pregunta' },
      { field: 'usuarioNombre', header: 'Estudiante' },
      { field: 'fecha', header: 'Fecha' },
      { field: 'respuestaContenido', header: 'Respuesta' }
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  loadPreguntas() {
    this.preguntaService.listarPreguntasPorCurso(this.idCurso).subscribe({
      next: (data) => {
        this.preguntas = data.map(p => ({ ...p }));
        this.cargarNombresUsuarios();
        this.cargarRespuestas();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las preguntas',
        life: 3000
      })
    });
  }

  cargarNombresUsuarios() {
    const idsUnicos = Array.from(
      new Set(this.preguntas.map(p => p.cveUsuario).filter(id => !!id))
    ) as number[];

    idsUnicos.forEach(id => {
      if (this.usuarioCache[id]) {
        this.preguntas.filter(p => p.cveUsuario === id).forEach(p => p.usuarioNombre = this.usuarioCache[id]);
      } else {
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
          next: (usuario: UsuarioDTO) => {
            this.usuarioCache[id] = usuario.nombre || '';
            this.preguntas.filter(p => p.cveUsuario === id).forEach(p => p.usuarioNombre = usuario.nombre || '');
          },
          error: () => {
            this.usuarioCache[id] = 'Desconocido';
            this.preguntas.filter(p => p.cveUsuario === id).forEach(p => p.usuarioNombre = 'Desconocido');
          }
        });
      }
    });
  }

  cargarRespuestas() {
    // Para cada pregunta, busca la respuesta (si existe)
    const observables = this.preguntas.map(pregunta =>
      this.respuestaService.obtenerRespuestaPorId(pregunta.cvePregunta!).pipe(
        catchError(() => of(undefined))
      )
    );

    forkJoin(observables).subscribe(respuestas => {
      this.preguntas.forEach((pregunta, idx) => {
        const respuesta = respuestas[idx] as RespuestaDTO | undefined;
        pregunta.respuestaContenido = respuesta?.contenido ? respuesta.contenido : 'Aún sin respuesta';
      });
    });
  }

  nuevaRespuesta(): RespuestaDTO {
    return {
      contenido: ''
    };
  }

  responderPregunta(pregunta: PreguntaDTO) {
    this.preguntaSeleccionada = pregunta;
    this.respuesta = this.nuevaRespuesta();
    this.submitted = false;
    this.respuestaDialog = true;
  }

  guardarRespuesta() {
    this.submitted = true;
    if (!this.respuesta.contenido || !this.respuesta.contenido.trim()) return;

    this.respuestaService.crearRespuesta(this.preguntaSeleccionada!.cvePregunta!, this.respuesta).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: 'Respuesta enviada',
          life: 3000
        });
        this.respuestaDialog = false;
        this.loadPreguntas();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la respuesta',
          life: 3000
        });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}