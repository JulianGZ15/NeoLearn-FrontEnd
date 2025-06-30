import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ClaseEnVivoDTO } from '../../../dtos/claseEnVivo.dto';
import { ClaseEnVivoService } from '../../Services/clase-en-vivo.service';
import { EstadoClase } from '../../../dtos/estadoClase.enum';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';


interface ClaseCalendario {
  clase: ClaseEnVivoDTO;
  fecha: Date;
  esHoy: boolean;
  esActiva: boolean;
  puedeIniciar: boolean;
}

interface DiaCalendario {
  fecha: Date;
  clases: ClaseCalendario[];
  tieneClases: boolean;
  tieneClasesActivas: boolean;
}

@Component({
  selector: 'app-calendario-clases',
  imports: [
    CommonModule,
    CalendarModule,
    CardModule,
    ButtonModule,
    ChipModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './calendario-clases.component.html',
  styleUrl: './calendario-clases.component.scss'
})
export class CalendarioClasesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() cursoId?: number;
  @Input() soloMisClases: boolean = false; // Para instructores

  // Datos del calendario
  fechaSeleccionada: Date = new Date();
  fechaActual: Date = new Date();
  clasesDelMes: ClaseEnVivoDTO[] = [];
  diasCalendario = new Map<string, DiaCalendario>();
  
  // Clases del día seleccionado
  clasesDelDia: ClaseCalendario[] = [];
  
  // Estados
  loading = false;
  mostrarDetalle = false;
  claseSeleccionada?: ClaseEnVivoDTO;
  
  // Configuración del calendario
  locale = {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    monthNames: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar'
  };

  // Enums para template
  EstadoClase = EstadoClase;

  constructor(
    private claseService: ClaseEnVivoService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarClasesDelMes();
    
    // Actualizar cada minuto para estados de clases
    setInterval(() => {
      this.actualizarEstadosClases();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cargar clases del mes actual
  cargarClasesDelMes(): void {
    this.loading = true;
    
    const inicioMes = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
    const finMes = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
    
    const request$ = this.soloMisClases 
      ? this.claseService.obtenerMisClases()
      : this.cursoId 
        ? this.claseService.listarPorCurso(this.cursoId)
        : this.claseService.listarClasesEnVivo();

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (clases) => {
        // Filtrar clases del mes actual
        this.clasesDelMes = clases.filter(clase => {
          const fechaClase = new Date(clase.fechaProgramada);
          return fechaClase >= inicioMes && fechaClase <= finMes;
        });
        
        this.procesarClasesParaCalendario();
        this.actualizarClasesDelDia();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las clases'
        });
        this.loading = false;
      }
    });
  }

  // Procesar clases para mostrar en calendario
  private procesarClasesParaCalendario(): void {
    this.diasCalendario.clear();
    
    this.clasesDelMes.forEach(clase => {
      const fechaClase = new Date(clase.fechaProgramada);
      const fechaKey = this.getFechaKey(fechaClase);
      
      const claseCalendario: ClaseCalendario = {
        clase,
        fecha: fechaClase,
        esHoy: this.esMismoDay(fechaClase, new Date()),
        esActiva: clase.estado === EstadoClase.EN_VIVO,
        puedeIniciar: this.claseService.puedeIniciarClase(clase)
      };
      
      if (!this.diasCalendario.has(fechaKey)) {
        this.diasCalendario.set(fechaKey, {
          fecha: fechaClase,
          clases: [],
          tieneClases: false,
          tieneClasesActivas: false
        });
      }
      
      const dia = this.diasCalendario.get(fechaKey)!;
      dia.clases.push(claseCalendario);
      dia.tieneClases = true;
      dia.tieneClasesActivas = dia.tieneClasesActivas || claseCalendario.esActiva;
    });
  }

  // Actualizar estados de clases (para detectar cambios en tiempo real)
  private actualizarEstadosClases(): void {
    this.diasCalendario.forEach(dia => {
      dia.clases.forEach(claseCalendario => {
        claseCalendario.esActiva = claseCalendario.clase.estado === EstadoClase.EN_VIVO;
        claseCalendario.puedeIniciar = this.claseService.puedeIniciarClase(claseCalendario.clase);
      });
      
      dia.tieneClasesActivas = dia.clases.some(c => c.esActiva);
    });
    
    this.actualizarClasesDelDia();
  }

  // Eventos del calendario
  onFechaSeleccionada(fecha: Date): void {
    this.fechaSeleccionada = fecha;
    this.actualizarClasesDelDia();
  }

  onMesCambiado(event: any): void {
    this.fechaActual = new Date(event.year, event.month, 1);
    this.cargarClasesDelMes();
  }

  // Actualizar clases del día seleccionado
  private actualizarClasesDelDia(): void {
    const fechaKey = this.getFechaKey(this.fechaSeleccionada);
    const dia = this.diasCalendario.get(fechaKey);
    
    this.clasesDelDia = dia ? dia.clases.sort((a, b) => 
      new Date(a.clase.fechaProgramada).getTime() - new Date(b.clase.fechaProgramada).getTime()
    ) : [];
  }

  // Acciones de clases
  iniciarClase(clase: ClaseEnVivoDTO): void {
    this.claseService.iniciarTransmision(clase.cveClaseEnVivo!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (claseActualizada) => {
          this.actualizarClaseEnLista(claseActualizada);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Clase iniciada correctamente'
          });
          
          // Navegar a la transmisión
          this.router.navigate(['/clase-vivo', claseActualizada.cveClaseEnVivo]);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al iniciar la clase'
          });
        }
      });
  }

  unirseAClase(clase: ClaseEnVivoDTO): void {
    this.router.navigate(['/clase-vivo', clase.cveClaseEnVivo]);
  }

  verDetalleClase(clase: ClaseEnVivoDTO): void {
    this.claseSeleccionada = clase;
    this.mostrarDetalle = true;
  }

  // Navegación rápida
  irAHoy(): void {
    this.fechaSeleccionada = new Date();
    this.fechaActual = new Date();
    this.cargarClasesDelMes();
  }

  irAMesAnterior(): void {
    this.fechaActual = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() - 1, 1);
    this.cargarClasesDelMes();
  }

  irAMesSiguiente(): void {
    this.fechaActual = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 1);
    this.cargarClasesDelMes();
  }

  // Utilidades
  private getFechaKey(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private esMismoDay(fecha1: Date, fecha2: Date): boolean {
    return this.getFechaKey(fecha1) === this.getFechaKey(fecha2);
  }

  private actualizarClaseEnLista(claseActualizada: ClaseEnVivoDTO): void {
    const index = this.clasesDelMes.findIndex(c => c.cveClaseEnVivo === claseActualizada.cveClaseEnVivo);
    if (index !== -1) {
      this.clasesDelMes[index] = claseActualizada;
      this.procesarClasesParaCalendario();
      this.actualizarClasesDelDia();
    }
  }

  // Métodos para el template
  getDiaCalendario(fecha: Date): DiaCalendario | undefined {
    return this.diasCalendario.get(this.getFechaKey(fecha));
  }

  getSeverityByEstado(estado: EstadoClase): string {
    const severities = {
      [EstadoClase.PROGRAMADA]: 'info',
      [EstadoClase.EN_VIVO]: 'success',
      [EstadoClase.FINALIZADA]: 'secondary',
      [EstadoClase.CANCELADA]: 'danger'
    };
    return severities[estado] || 'secondary';
  }

  getIconByEstado(estado: EstadoClase): string {
    const icons = {
      [EstadoClase.PROGRAMADA]: 'pi pi-clock',
      [EstadoClase.EN_VIVO]: 'pi pi-play-circle',
      [EstadoClase.FINALIZADA]: 'pi pi-check-circle',
      [EstadoClase.CANCELADA]: 'pi pi-times-circle'
    };
    return icons[estado] || 'pi pi-circle';
  }

  formatearHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearDuracion(minutos?: number): string {
    if (!minutos) return 'No especificada';
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins > 0 ? mins + 'm' : ''}`.trim();
    }
    return `${mins}m`;
  }

    get totalClasesDelMes(): number {
    return this.clasesDelMes.length;
  }

  get clasesEnVivoCount(): number {
    return this.clasesDelMes.filter(c => c.estado === EstadoClase.EN_VIVO).length;
  }

  get clasesProgramadasCount(): number {
    return this.clasesDelMes.filter(c => c.estado === EstadoClase.PROGRAMADA).length;
  }

  get clasesFinalizadasCount(): number {
    return this.clasesDelMes.filter(c => c.estado === EstadoClase.FINALIZADA).length;
  }

  // ✅ Método para verificar si es el mismo día (corregir el nombre)
  esMismoDia(fecha1: Date, fecha2: Date): boolean {
    return this.getFechaKey(fecha1) === this.getFechaKey(fecha2);
  }
}