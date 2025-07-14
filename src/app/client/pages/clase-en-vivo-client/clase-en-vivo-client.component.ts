import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, interval } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ClaseEnVivoDTO } from '../../../../dtos/claseEnVivo.dto';
import { UsuarioDTO } from '../../../../dtos/usuario.dto';
import { ClasesClientService } from '../../services/clases-client.service';
import { UsuarioService } from '../../../Admin/Services/usuario.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { EstadoClase } from '../../../../dtos/estadoClase.enum';

interface ClaseConEstado extends ClaseEnVivoDTO {
  puedeUnirse: boolean;
  tiempoRestante: string;
  estadoVisual: EstadoClase; // Cambiar de string a EstadoClase
}

@Component({
  selector: 'app-clase-en-vivo-client',
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    CardModule,
    ProgressSpinner,
    DropdownModule,
    ChipModule,
    ReactiveFormsModule,
    FormsModule,

  ],
  templateUrl: './clase-en-vivo-client.component.html',
  styleUrl: './clase-en-vivo-client.component.scss'
})
export class ClaseEnVivoClientComponent implements OnInit, OnDestroy {
  @Input() cursoId?: number; // Para recibir el ID del curso como input
  readonly EstadoClase = EstadoClase;
  clases: ClaseConEstado[] = [];
  clasesAgrupadas: { [key: string]: ClaseConEstado[] } = {};
  usuarioActual?: UsuarioDTO;
  
  // Estados de carga
  loading = false;
  
  // Filtros
  filtroEstado: string = 'todas';
  filtroFecha: string = 'todas';
  
  // Opciones de filtro
// Opciones de filtro actualizadas
opcionesEstado = [
  { label: 'Todas las clases', value: 'todas' },
  { label: 'Programadas', value: EstadoClase.PROGRAMADA },
  { label: 'En vivo', value: EstadoClase.EN_VIVO },
  { label: 'Finalizadas', value: EstadoClase.FINALIZADA },
  { label: 'Canceladas', value: EstadoClase.CANCELADA }
];

  
  opcionesFecha = [
    { label: 'Todas las fechas', value: 'todas' },
    { label: 'Hoy', value: 'hoy' },
    { label: 'Esta semana', value: 'semana' },
    { label: 'Este mes', value: 'mes' }
  ];
  
  private destroy$ = new Subject<void>();
  private timerSubscription?: any;

  constructor(
    private clasesService: ClasesClientService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
 this.route.params.subscribe(params => {
      this.cursoId = this.cursoId || +params['id'];
      this.cargarDatosIniciales();
    });
        this.iniciarTimer();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

    private cargarDatosIniciales() {
    this.loading = true;
    
    this.usuarioService.obtenerUsuario()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (usuario) => {
          this.usuarioActual = usuario;
          this.cargarClases();
        },
        error: (error) => {
          console.error('Error al cargar usuario:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la información del usuario'
          });
        }
      });
  }

  private cargarClases() {
    if (!this.cursoId) {
      // Si no hay cursoId, cargar todas las clases en vivo del usuario
      this.cargarTodasLasClasesEnVivo();
      return;
    }

    // Cargar clases específicas del curso
    this.clasesService.listarPorCurso(this.cursoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clases) => {
          this.procesarClases(clases);
          this.agruparClases();
        },
        error: (error) => {
          console.error('Error al cargar clases del curso:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las clases del curso'
          });
        }
      });
  }

   private cargarTodasLasClasesEnVivo() {
    // Método fallback para cargar solo clases en vivo
    this.clasesService.listarClasesEnVivo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clases) => {
          this.procesarClases(clases);
          this.agruparClases();
        },
        error: (error) => {
          console.error('Error al cargar clases en vivo:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las clases en vivo'
          });
        }
      });
  }

  private procesarClases(clases: ClaseEnVivoDTO[]) {
  this.clases = clases.map(clase => {
    const ahora = new Date();
    const fechaProgramada = new Date(clase.fechaProgramada);
    const fechaInicio = clase.fechaInicio ? new Date(clase.fechaInicio) : null;
    const fechaFin = clase.fechaFin ? new Date(clase.fechaFin) : null;
    
    let estadoVisual: EstadoClase;
    let puedeUnirse = false;
    let tiempoRestante = '';

    // Usar el estado del DTO si está disponible, sino calcularlo
    if (clase.estado) {
      estadoVisual = clase.estado;
    } else {
      // Lógica de fallback si no viene el estado del backend
      if (clase.finalizada || (fechaFin && ahora > fechaFin)) {
        estadoVisual = EstadoClase.FINALIZADA;
      } else if (fechaInicio && ahora >= fechaInicio && (!fechaFin || ahora <= fechaFin)) {
        estadoVisual = EstadoClase.EN_VIVO;
      } else if (ahora < fechaProgramada) {
        estadoVisual = EstadoClase.PROGRAMADA;
      } else {
        estadoVisual = EstadoClase.FINALIZADA; // Clase perdida se considera finalizada
      }
    }

    // Determinar si puede unirse y tiempo restante basado en el estado
    switch (estadoVisual) {
      case EstadoClase.EN_VIVO:
        puedeUnirse = true;
        tiempoRestante = 'En vivo ahora';
        break;
        
      case EstadoClase.PROGRAMADA:
        tiempoRestante = this.calcularTiempoRestante(fechaProgramada);
        // Permitir unirse 10 minutos antes
        puedeUnirse = (fechaProgramada.getTime() - ahora.getTime()) <= 10 * 60 * 1000;
        break;
        
      case EstadoClase.FINALIZADA:
        tiempoRestante = 'Finalizada';
        puedeUnirse = false;
        break;
        
      case EstadoClase.CANCELADA:
        tiempoRestante = 'Cancelada';
        puedeUnirse = false;
        break;
        
      default:
        tiempoRestante = 'Estado desconocido';
        puedeUnirse = false;
    }

    return {
      ...clase,
      puedeUnirse,
      tiempoRestante,
      estadoVisual
    };
  });
}


  private calcularTiempoRestante(fechaProgramada: Date): string {
    const ahora = new Date();
    const diferencia = fechaProgramada.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Iniciando...';
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (dias > 0) {
      return `En ${dias}d ${horas}h`;
    } else if (horas > 0) {
      return `En ${horas}h ${minutos}m`;
    } else {
      return `En ${minutos}m`;
    }
  }

public agruparClases() {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  
  this.clasesAgrupadas = {
    'Hoy': [],
    'Mañana': [],
    'Esta semana': [],
    'Próximamente': [],
    'Finalizadas': [],
    'Canceladas': []
  };

  this.clasesFiltradas.forEach(clase => {
    const fechaClase = new Date(clase.fechaProgramada);
    
    if (this.esMismaFecha(fechaClase, hoy)) {
      this.clasesAgrupadas['Hoy'].push(clase);
    } else if (this.esMismaFecha(fechaClase, manana)) {
      this.clasesAgrupadas['Mañana'].push(clase);
    } else if (this.esEstaSemanaSinHoyNiManana(fechaClase, hoy)) {
      this.clasesAgrupadas['Esta semana'].push(clase);
    } else {
      // Agrupar por estado para fechas futuras
      switch (clase.estadoVisual) {
        case EstadoClase.PROGRAMADA:
          this.clasesAgrupadas['Próximamente'].push(clase);
          break;
        case EstadoClase.FINALIZADA:
          this.clasesAgrupadas['Finalizadas'].push(clase);
          break;
        case EstadoClase.CANCELADA:
          this.clasesAgrupadas['Canceladas'].push(clase);
          break;
        // EN_VIVO no debería estar aquí, pero por seguridad:
        case EstadoClase.EN_VIVO:
          this.clasesAgrupadas['Hoy'].push(clase);
          break;
      }
    }
  });
}



  private iniciarTimer() {
    // Actualizar cada minuto
    this.timerSubscription = interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.procesarClases(this.clases);
        this.agruparClases();
      });
  }

  // Getters para filtros
  get clasesFiltradas(): ClaseConEstado[] {
    let clasesFiltradas = [...this.clases];

    // Filtrar por estado
    if (this.filtroEstado !== 'todas') {
      clasesFiltradas = clasesFiltradas.filter(clase => 
        clase.estadoVisual === this.filtroEstado
      );
    }

    // Filtrar por fecha
    if (this.filtroFecha !== 'todas') {
      const hoy = new Date();
      clasesFiltradas = clasesFiltradas.filter(clase => {
        const fechaClase = new Date(clase.fechaProgramada);
        
        switch (this.filtroFecha) {
          case 'hoy':
            return this.esMismaFecha(fechaClase, hoy);
          case 'semana':
            return this.esEstaSemanaSinHoyNiManana(fechaClase, hoy) || 
                   this.esMismaFecha(fechaClase, hoy);
          case 'mes':
            return fechaClase.getMonth() === hoy.getMonth() && 
                   fechaClase.getFullYear() === hoy.getFullYear();
          default:
            return true;
        }
      });
    }

    return clasesFiltradas.sort((a, b) => 
      new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
    );
  }

  // Acciones
unirseAClase(clase: ClaseConEstado) {
  // Validaciones adicionales basadas en el estado
  this.router.navigate(['client/cursos/clase-vivo', clase.cveClaseEnVivo]);
  if (clase.estadoVisual === EstadoClase.CANCELADA) {
    this.messageService.add({
      severity: 'error',
      summary: 'Clase Cancelada',
      detail: 'Esta clase ha sido cancelada'
    });
    return;
  }

  if (clase.estadoVisual === EstadoClase.FINALIZADA) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Clase Finalizada',
      detail: 'Esta clase ya ha finalizado'
    });
    return;
  }

  if (!clase.puedeUnirse) {
    let mensaje = 'La clase aún no está disponible para unirse';
    
    if (clase.estadoVisual === EstadoClase.PROGRAMADA) {
      mensaje = 'Podrás unirte 10 minutos antes del inicio de la clase';
    }
    
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: mensaje
    });
    return;
  }

  // Navegar al componente de videollamada
  this.router.navigate(['client/curso/clase-vivo', clase.cveClaseEnVivo],{ 
    queryParams: {
      salaId: clase.salaId,
      codigoSala: clase.codigoSala,
      titulo: clase.titulo
    }
  });
}


  verDetalle(clase: ClaseConEstado) {
    this.clasesService.obtenerDetalle(clase.cveClaseEnVivo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detalle) => {
          // Aquí podrías abrir un modal con más detalles
          console.log('Detalle de clase:', detalle);
        },
        error: (error) => {
          console.error('Error al obtener detalle:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener el detalle de la clase'
          });
        }
      });
  }

  refrescarClases() {
    this.cargarClases();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Lista de clases actualizada'
    });
  }

  // Utilidades
  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getDate() === fecha2.getDate() &&
           fecha1.getMonth() === fecha2.getMonth() &&
           fecha1.getFullYear() === fecha2.getFullYear();
  }

  private esEstaSemanaSinHoyNiManana(fechaClase: Date, hoy: Date): boolean {
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    return fechaClase >= inicioSemana && 
           fechaClase <= finSemana && 
           !this.esMismaFecha(fechaClase, hoy) && 
           !this.esMismaFecha(fechaClase, manana);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  

  obtenerSeveridadEstado(estado: EstadoClase): string {
  switch (estado) {
    case EstadoClase.EN_VIVO: 
      return 'success';
    case EstadoClase.PROGRAMADA: 
      return 'info';
    case EstadoClase.FINALIZADA: 
      return 'secondary';
    case EstadoClase.CANCELADA: 
      return 'danger';
    default: 
      return 'info';
  }
}

obtenerIconoEstado(estado: EstadoClase): string {
  switch (estado) {
    case EstadoClase.EN_VIVO: 
      return 'pi pi-circle-fill';
    case EstadoClase.PROGRAMADA: 
      return 'pi pi-clock';
    case EstadoClase.FINALIZADA: 
      return 'pi pi-check-circle';
    case EstadoClase.CANCELADA: 
      return 'pi pi-times-circle';
    default: 
      return 'pi pi-clock';
  }
}

obtenerEtiquetaEstado(estado: EstadoClase): string {
  switch (estado) {
    case EstadoClase.EN_VIVO: 
      return 'En Vivo';
    case EstadoClase.PROGRAMADA: 
      return 'Programada';
    case EstadoClase.FINALIZADA: 
      return 'Finalizada';
    case EstadoClase.CANCELADA: 
      return 'Cancelada';
    default: 
      return 'Desconocido';
  }
}

obtenerEtiquetaBoton(clase: ClaseConEstado): string {
  switch (clase.estadoVisual) {
    case EstadoClase.EN_VIVO:
      return 'Unirse Ahora';
    case EstadoClase.PROGRAMADA:
      return clase.puedeUnirse ? 'Unirse a Clase' : 'Próximamente';
    case EstadoClase.FINALIZADA:
      return 'Finalizada';
    case EstadoClase.CANCELADA:
      return 'Cancelada';
    default:
      return 'No disponible';
  }
}

obtenerIconoBoton(clase: ClaseConEstado): string {
  switch (clase.estadoVisual) {
    case EstadoClase.EN_VIVO:
      return 'pi pi-play';
    case EstadoClase.PROGRAMADA:
      return 'pi pi-video';
    case EstadoClase.FINALIZADA:
      return 'pi pi-check';
    case EstadoClase.CANCELADA:
      return 'pi pi-times';
    default:
      return 'pi pi-video';
  }
}


  obtenerDuracionFormateada(clase: ClaseConEstado): string {
    return this.clasesService.obtenerDuracionFormateada(clase);
  }
  get clasesAgrupadasKeys(): string[] {
  return Object.keys(this.clasesAgrupadas);
}

}