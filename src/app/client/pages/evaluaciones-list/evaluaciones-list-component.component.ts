import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EvaluacionDTO } from '../../../../dtos/evaluacion.dto';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';
import { EvaluacionesClientService } from '../../services/evaluaciones-client.service';
import { ResultadoEvaluacionClientService } from '../../services/resultado-evaluacion-client.service';
import { UsuarioService } from '../../../Admin/Services/usuario.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

interface EvaluacionConEstado extends EvaluacionDTO {
  completada: boolean;
  calificacion?: number;
  fechaCompletada?: string;
  puedeTomarla: boolean;
  intentos: number;
}

@Component({
  selector: 'app-evaluaciones-list-component',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    TagModule,
    ChipModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './evaluaciones-list-component.component.html',
  styleUrl: './evaluaciones-list-component.component.scss'
})
export class EvaluacionesListComponent implements OnInit, OnDestroy {
  @Input() cursoId!: number;
  
  evaluaciones: EvaluacionConEstado[] = [];
  usuarioActual?: UsuarioDTO;
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionesService: EvaluacionesClientService,
    private resultadosService: ResultadoEvaluacionClientService,
    private usuarioService: UsuarioService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cursoId = this.cursoId || +params['cursoId'];
      this.cargarDatos();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatos() {
    this.loading = true;
    
    forkJoin({
      usuario: this.usuarioService.obtenerUsuario(),
      evaluaciones: this.evaluacionesService.listarEvaluacionesPorCurso(this.cursoId)
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.usuarioActual = data.usuario;
        this.procesarEvaluaciones(data.evaluaciones);
      },
      error: (error) => {
        console.error('Error al cargar evaluaciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las evaluaciones'
        });
      }
    });
  }

  private procesarEvaluaciones(evaluaciones: EvaluacionDTO[]) {
    const evaluacionesConEstado: EvaluacionConEstado[] = evaluaciones.map(evaluacion => ({
      ...evaluacion,
      completada: false,
      puedeTomarla: true,
      intentos: 0
    }));

    // Cargar resultados para cada evaluación
    const resultadosObservables = evaluaciones.map(evaluacion =>
      this.resultadosService.listarResultadosPorEvaluacion(evaluacion.cveEvaluacion!)
    );

    forkJoin(resultadosObservables).subscribe({
      next: (resultadosArrays) => {
        evaluacionesConEstado.forEach((evaluacion, index) => {
          const resultados = resultadosArrays[index];
          const resultadosUsuario = resultados.filter(r => r.cveUsuario === this.usuarioActual?.cveUsuario);
          
          if (resultadosUsuario.length > 0) {
            const ultimoResultado = resultadosUsuario[resultadosUsuario.length - 1];
            evaluacion.completada = true;
            evaluacion.calificacion = ultimoResultado.calificacion;
            evaluacion.fechaCompletada = ultimoResultado.fecha;
            evaluacion.intentos = resultadosUsuario.length;
          }
        });
        
        this.evaluaciones = evaluacionesConEstado;
      },
      error: (error) => {
        console.error('Error al cargar resultados:', error);
        this.evaluaciones = evaluacionesConEstado;
      }
    });
  }

  iniciarEvaluacion(evaluacion: EvaluacionConEstado) {
    this.router.navigate(['client/curso/evaluacion', evaluacion.cveEvaluacion, 'tomar']);
  }

  verResultado(evaluacion: EvaluacionConEstado) {
    this.router.navigate(['client/curso/evaluacion', evaluacion.cveEvaluacion, 'resultado']);
  }

  formatearDuracion(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins > 0 ? mins + 'm' : ''}`;
  }

  obtenerColorCalificacion(calificacion: number): string {
    if (calificacion >= 80) return 'success';
    if (calificacion >= 60) return 'warning';
    return 'danger';
  }

  obtenerIconoEstado(evaluacion: EvaluacionConEstado): string {
    if (evaluacion.completada) {
      return evaluacion.calificacion! >= 60 ? 'pi pi-check-circle' : 'pi pi-times-circle';
    }
    return 'pi pi-clock';
  }
}
