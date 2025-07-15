import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EvaluacionDTO } from '../../../../dtos/evaluacion.dto';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';
import { EvaluacionesClientService } from '../../services/evaluaciones-client.service';
import { PreguntasEvaluacionClientService } from '../../services/preguntas-evaluacion-client.service';
import { RespuestasEvaluacionClientService } from '../../services/respuestas-evaluacion-client.service';
import { ResultadoEvaluacionClientService } from '../../services/resultado-evaluacion-client.service';
import { UsuarioService } from '../../../Admin/Services/usuario.service';
import { PreguntaEvaluacionDTO } from '../../../../dtos/preguntaEvaluacion.dto';
import { ResultadoEvaluacionDTO } from '../../../../dtos/resultadoEvaluacion.dto';
import { RespuestaEvaluacionDTO } from '../../../../dtos/respuestaEvaluacion.dto';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';

interface PreguntaConResultado extends PreguntaEvaluacionDTO {
  respuestaUsuario?: string;
  esCorrecta: boolean;
  textoOpcionUsuario?: string;
  textoOpcionCorrecta?: string;
  opciones: { valor: string; texto: string; esCorrecta: boolean; seleccionada: boolean }[];
}

interface EstadisticasEvaluacion {
  totalPreguntas: number;
  respuestasCorrectas: number;
  respuestasIncorrectas: number;
  calificacion: number;
  porcentajeAcierto: number;
  estado: 'aprobada' | 'reprobada';
  tiempoUtilizado?: string;
}

@Component({
  selector: 'app-evaluaciones-result-component',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    TagModule,
    ButtonModule,
    ToastModule,
    ProgressBarModule,
    RadioButtonModule,
    DropdownModule,
    FormsModule,
    ConfirmDialogModule
  ],
  templateUrl: './evaluaciones-result-component.component.html',
  styleUrl: './evaluaciones-result-component.component.scss'
})
export class EvaluacionesResultComponent implements OnInit, OnDestroy {
  evaluacionId!: number;
  evaluacion?: EvaluacionDTO;
  resultado?: ResultadoEvaluacionDTO;
  preguntas: PreguntaConResultado[] = [];
  estadisticas?: EstadisticasEvaluacion;
  usuarioActual?: UsuarioDTO;
  cveCurso:number = 0;
  
  // Estados
  loading = false;
  mostrarRespuestas = false;
  
  // Filtros para revisión
  filtroRespuestas: 'todas' | 'correctas' | 'incorrectas' = 'todas';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionesService: EvaluacionesClientService,
    private preguntasService: PreguntasEvaluacionClientService,
    private respuestasService: RespuestasEvaluacionClientService,
    private resultadosService: ResultadoEvaluacionClientService,
    private usuarioService: UsuarioService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.evaluacionId = +params['id'];
      this.cargarResultado();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarResultado() {
    this.loading = true;
    
    forkJoin({
      usuario: this.usuarioService.obtenerUsuario(),
      evaluacion: this.evaluacionesService.obtenerEvaluacionPorId(this.evaluacionId),
      preguntas: this.preguntasService.listarPreguntasPorEvaluacion(this.evaluacionId),
      resultados: this.resultadosService.listarResultadosPorEvaluacion(this.evaluacionId)
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.usuarioActual = data.usuario;
        this.evaluacion = data.evaluacion;
        
        // Buscar el resultado del usuario actual
        this.resultado = data.resultados.find(r => r.cveUsuario === this.usuarioActual?.cveUsuario);
        
        if (!this.resultado) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se encontró el resultado de la evaluación'
          });
          this.router.navigate(['/evaluaciones']);
          return;
        }
        
        this.procesarPreguntasYRespuestas(data.preguntas);
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar resultado:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el resultado de la evaluación'
        });
        this.router.navigate(['/evaluaciones']);
      }
    });
    
  }
 volverALista() {
    if (this.evaluacion?.cursoId) {
      this.router.navigate(['client/curso/', this.evaluacion.cursoId, 'evaluaciones']);
    } else {
      // Fallback si no hay cursoId
      this.router.navigate(['client/dashboard']);
    }
  }

  
  private procesarPreguntasYRespuestas(preguntas: PreguntaEvaluacionDTO[]) {
    // Nota: Aquí necesitarías cargar las respuestas del usuario para este resultado específico
    // Por simplicidad, asumiré que tienes un método para obtener las respuestas por resultado
    this.cargarRespuestasUsuario(preguntas);
  }

private cargarRespuestasUsuario(preguntas: PreguntaEvaluacionDTO[]) {
  // Validar que tenemos el resultado necesario
  if (!this.resultado?.cveResultadoEvaluacion) {
    console.error('No se encontró cveResultadoEvaluacion para cargar respuestas');
    this.procesarPreguntasSinRespuestas(preguntas);
    return;
  }
  
  // Mostrar loading (opcional)
  this.loading = true;
  
  // Cargar respuestas del usuario
  this.respuestasService.obbtenerRespuestasPorResultado(this.resultado.cveResultadoEvaluacion)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: (respuestas) => {
        console.log('Respuestas cargadas:', respuestas);
        this.procesarPreguntasConRespuestas(preguntas, respuestas);
      },
      error: (error) => {
        console.error('Error al cargar respuestas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las respuestas. Mostrando solo las preguntas.'
        });
        this.procesarPreguntasSinRespuestas(preguntas);
      }
    });
}

private procesarPreguntasConRespuestas(preguntas: PreguntaEvaluacionDTO[], respuestas: RespuestaEvaluacionDTO[]) {
  this.preguntas = preguntas.map(pregunta => {
    // Buscar respuesta del usuario para esta pregunta
    const respuestaUsuario = respuestas.find(r => r.cvePreguntaEvaluacion === pregunta.cvePreguntaEvaluacion);
    const respuestaSeleccionada = respuestaUsuario?.respuestaUsuario || '';
    const esCorrecta = respuestaSeleccionada === pregunta.respuesta_correcta;
    
    // Crear opciones
    const opciones = [
      { valor: 'A', texto: pregunta.opcion_a || '', esCorrecta: pregunta.respuesta_correcta === 'A', seleccionada: respuestaSeleccionada === 'A' },
      { valor: 'B', texto: pregunta.opcion_b || '', esCorrecta: pregunta.respuesta_correcta === 'B', seleccionada: respuestaSeleccionada === 'B' },
      { valor: 'C', texto: pregunta.opcion_c || '', esCorrecta: pregunta.respuesta_correcta === 'C', seleccionada: respuestaSeleccionada === 'C' },
      { valor: 'D', texto: pregunta.opcion_d || '', esCorrecta: pregunta.respuesta_correcta === 'D', seleccionada: respuestaSeleccionada === 'D' }
    ].filter(opcion => opcion.texto.trim() !== '');
    
    return {
      ...pregunta,
      respuestaUsuario: respuestaSeleccionada,
      esCorrecta,
      textoOpcionUsuario: opciones.find(o => o.valor === respuestaSeleccionada)?.texto || 'Sin respuesta',
      textoOpcionCorrecta: opciones.find(o => o.valor === pregunta.respuesta_correcta)?.texto || 'Opción no encontrada',
      opciones
    };
  });
  
  this.calcularEstadisticas();
}

private procesarPreguntasSinRespuestas(preguntas: PreguntaEvaluacionDTO[]) {
  // Fallback cuando no se pueden cargar las respuestas
  this.preguntas = preguntas.map(pregunta => {
    const opciones = [
      { valor: 'A', texto: pregunta.opcion_a || '', esCorrecta: pregunta.respuesta_correcta === 'A', seleccionada: false },
      { valor: 'B', texto: pregunta.opcion_b || '', esCorrecta: pregunta.respuesta_correcta === 'B', seleccionada: false },
      { valor: 'C', texto: pregunta.opcion_c || '', esCorrecta: pregunta.respuesta_correcta === 'C', seleccionada: false },
      { valor: 'D', texto: pregunta.opcion_d || '', esCorrecta: pregunta.respuesta_correcta === 'D', seleccionada: false }
    ].filter(opcion => opcion.texto.trim() !== '');
    
    return {
      ...pregunta,
      respuestaUsuario: '',
      esCorrecta: false,
      textoOpcionUsuario: 'Sin respuesta',
      textoOpcionCorrecta: opciones.find(o => o.valor === pregunta.respuesta_correcta)?.texto || 'Opción no encontrada',
      opciones
    };
  });
  
  this.calcularEstadisticas();
}


  private calcularEstadisticas() {
    if (!this.preguntas.length || !this.resultado) return;
    
    const totalPreguntas = this.preguntas.length;
    const respuestasCorrectas = this.preguntas.filter(p => p.esCorrecta).length;
    const respuestasIncorrectas = totalPreguntas - respuestasCorrectas;
    const calificacion = this.resultado.calificacion || 0;
    const porcentajeAcierto = Math.round((respuestasCorrectas / totalPreguntas) * 100);
    
    this.estadisticas = {
      totalPreguntas,
      respuestasCorrectas,
      respuestasIncorrectas,
      calificacion,
      porcentajeAcierto,
      estado: calificacion >= 60 ? 'aprobada' : 'reprobada'
    };
  }

  // Getters para filtros
  get preguntasFiltradas(): PreguntaConResultado[] {
    switch (this.filtroRespuestas) {
      case 'correctas':
        return this.preguntas.filter(p => p.esCorrecta);
      case 'incorrectas':
        return this.preguntas.filter(p => !p.esCorrecta);
      default:
        return this.preguntas;
    }
  }


  // Acciones
  repetirEvaluacion() {
    this.router.navigate(['client/curso/evaluacion', this.evaluacionId, 'tomar']);
  }



  toggleMostrarRespuestas() {
    this.mostrarRespuestas = !this.mostrarRespuestas;
  }

  // Utilidades
  obtenerColorCalificacion(calificacion: number): string {
    if (calificacion >= 80) return 'success';
    if (calificacion >= 60) return 'warning';
    return 'danger';
  }

  obtenerIconoEstado(estado: 'aprobada' | 'reprobada'): string {
    return estado === 'aprobada' ? 'pi pi-check-circle' : 'pi pi-times-circle';
  }

  obtenerColorEstado(estado: 'aprobada' | 'reprobada'): string {
    return estado === 'aprobada' ? 'success' : 'danger';
  }

  obtenerMensajeEstado(estado: 'aprobada' | 'reprobada'): string {
    return estado === 'aprobada' ? '¡Felicidades! Has aprobado la evaluación' : 'No has alcanzado la calificación mínima';
  }

  obtenerColorPregunta(esCorrecta: boolean): string {
    return esCorrecta ? 'success' : 'danger';
  }

  obtenerIconoPregunta(esCorrecta: boolean): string {
    return esCorrecta ? 'pi pi-check' : 'pi pi-times';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}