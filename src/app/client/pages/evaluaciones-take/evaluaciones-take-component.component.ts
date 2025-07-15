import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin, switchMap, map } from 'rxjs';
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

interface PreguntaConRespuesta extends PreguntaEvaluacionDTO {
  respuestaSeleccionada?: string;
  opciones: { valor: string; texto: string }[];
}
@Component({
  selector: 'app-evaluaciones-take-component',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    TagModule,
    ButtonModule,
    ToastModule,
    ProgressBarModule,
    RadioButtonModule,
    FormsModule,
    ConfirmDialogModule
  ],
  templateUrl: './evaluaciones-take-component.component.html',
  styleUrl: './evaluaciones-take-component.component.scss'
})
export class EvaluacionesTakeComponent implements OnInit, OnDestroy {
  evaluacionId!: number;
  evaluacion?: EvaluacionDTO;
  preguntas: PreguntaConRespuesta[] = [];
  usuarioActual?: UsuarioDTO;
  
  // Estados
  loading = false;
  enviando = false;
  tiempoRestante = 0;
  timerInterval?: any;
  
  // Navegación
  preguntaActual = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionesService: EvaluacionesClientService,
    private preguntasService: PreguntasEvaluacionClientService,
    private respuestasService: RespuestasEvaluacionClientService,
    private resultadosService: ResultadoEvaluacionClientService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.evaluacionId = +params['id'];
      this.cargarEvaluacion();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private cargarEvaluacion() {
    this.loading = true;
    
    forkJoin({
      usuario: this.usuarioService.obtenerUsuario(),
      evaluacion: this.evaluacionesService.obtenerEvaluacionPorId(this.evaluacionId),
      preguntas: this.preguntasService.listarPreguntasPorEvaluacion(this.evaluacionId)
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.usuarioActual = data.usuario;
        this.evaluacion = data.evaluacion;
        this.procesarPreguntas(data.preguntas);
        this.iniciarTimer();
      },
      error: (error) => {
        console.error('Error al cargar evaluación:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la evaluación'
        });
        this.router.navigate(['/evaluaciones']);
      }
    });
  }

  private procesarPreguntas(preguntas: PreguntaEvaluacionDTO[]) {
    this.preguntas = preguntas.map(pregunta => ({
      ...pregunta,
      opciones: [
        { valor: 'A', texto: pregunta.opcion_a || '' },
        { valor: 'B', texto: pregunta.opcion_b || '' },
        { valor: 'C', texto: pregunta.opcion_c || '' },
        { valor: 'D', texto: pregunta.opcion_d || '' }
      ].filter(opcion => opcion.texto.trim() !== '')
    }));
  }

  private iniciarTimer() {
    if (this.evaluacion?.duracion_minutos) {
      this.tiempoRestante = this.evaluacion.duracion_minutos * 60; // Convertir a segundos
      
      this.timerInterval = setInterval(() => {
        this.tiempoRestante--;
        
        if (this.tiempoRestante <= 0) {
          this.enviarEvaluacionAutomaticamente();
        }
      }, 1000);
    }
  }

  // Navegación entre preguntas
  siguientePregunta() {
    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
    }
  }

  preguntaAnterior() {
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
    }
  }

  irAPregunta(index: number) {
    this.preguntaActual = index;
  }

  // Gestión de respuestas
  seleccionarRespuesta(pregunta: PreguntaConRespuesta, respuesta: string) {
    pregunta.respuestaSeleccionada = respuesta;
  }

  // Envío de evaluación
  enviarEvaluacion() {
    const preguntasRespondidas = this.preguntas.filter(p => p.respuestaSeleccionada).length;
    const totalPreguntas = this.preguntas.length;
    
    if (preguntasRespondidas < totalPreguntas) {
      this.confirmationService.confirm({
        message: `Has respondido ${preguntasRespondidas} de ${totalPreguntas} preguntas. ¿Estás seguro de enviar la evaluación?`,
        header: 'Confirmar envío',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.procesarEnvio();
        }
      });
    } else {
      this.procesarEnvio();
    }
  }

  private enviarEvaluacionAutomaticamente() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Tiempo agotado',
      detail: 'El tiempo se ha agotado. Enviando evaluación automáticamente...'
    });
    
    setTimeout(() => {
      this.procesarEnvio();
    }, 2000);
  }

private procesarEnvio() {
  this.enviando = true;
  
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
  }

  // Calcular calificación
  const calificacion = this.calcularCalificacion();
  
  // Crear resultado
  const resultado: ResultadoEvaluacionDTO = {
    cveEvaluacion: this.evaluacionId,
    cveUsuario: this.usuarioActual?.cveUsuario,
    calificacion: calificacion,
    fecha: new Date().toISOString()
  };

  // PASO 1: Guardar el resultado primero
  this.resultadosService.crearResultadoEvaluacion(resultado)
    .pipe(
      takeUntil(this.destroy$),
      // Encadenar la llamada para guardar respuestas
      switchMap((resultadoCreado) => {
        // Crear respuestas usando el cveResultadoEvaluacion devuelto
        const respuestas: RespuestaEvaluacionDTO[] = this.preguntas.map(pregunta => ({
          cveRespuestaEvaluacion: 0,
          cveResultadoEvaluacion: resultadoCreado.cveResultadoEvaluacion!,
          cvePreguntaEvaluacion: pregunta.cvePreguntaEvaluacion!,
          respuestaUsuario: pregunta.respuestaSeleccionada || ''
        }));

        // Devolver observable de respuestas junto con el resultado
        return this.respuestasService.crearRespuestasEvaluacion(respuestas).pipe(
          map(respuestasCreadas => ({ resultadoCreado, respuestasCreadas, calificacion }))
        );
      }),
      finalize(() => this.enviando = false)
    )
    .subscribe({
      next: ({ resultadoCreado, respuestasCreadas, calificacion }) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Evaluación enviada',
          detail: `Tu calificación es: ${calificacion}%`
        });
        
        // Navegar a resultados
        setTimeout(() => {
          this.router.navigate(['client/curso/evaluacion', this.evaluacionId, 'resultado']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al enviar evaluación:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la evaluación. Inténtalo de nuevo.'
        });
      }
    });
}


  private calcularCalificacion(): number {
    const totalPreguntas = this.preguntas.length;
    if (totalPreguntas === 0) return 0;
    
    const respuestasCorrectas = this.preguntas.filter(pregunta => 
      pregunta.respuestaSeleccionada === pregunta.respuesta_correcta
    ).length;
    
    return Math.round((respuestasCorrectas / totalPreguntas) * 100);
  }

  // Utilidades
  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  obtenerProgreso(): number {
    const respondidas = this.preguntas.filter(p => p.respuestaSeleccionada).length;
    return Math.round((respondidas / this.preguntas.length) * 100);
  }

  esPreguntaRespondida(index: number): boolean {
    return !!this.preguntas[index]?.respuestaSeleccionada;
  }

  obtenerColorTiempo(): string {
    const porcentaje = (this.tiempoRestante / (this.evaluacion?.duracion_minutos! * 60)) * 100;
    if (porcentaje > 50) return 'success';
    if (porcentaje > 25) return 'warning';
    return 'danger';
  }
}