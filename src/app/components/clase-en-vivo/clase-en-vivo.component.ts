import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { MessagesModule } from 'primeng/messages';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SignalingService } from '../../Services/signaling.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ClaseEnVivoDTO, ProgramarClaseRequest } from '../../../dtos/claseEnVivo.dto';
import { SalaEnVivoDTO } from '../../../dtos/salaEnVivo.dto';
import { EstadoClase } from '../../../dtos/estadoClase.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaseEnVivoService } from '../../Services/clase-en-vivo.service';
import { SalaEnVivoService } from '../../Services/sala-en-vivo.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-clase-en-vivo',
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
    ConfirmDialogModule,
    CardModule,
    ChipModule,
    AvatarModule,
    MessagesModule,
    ProgressSpinnerModule,
    DropdownModule,
    DividerModule,
    CalendarModule],
  templateUrl: './clase-en-vivo.component.html',
  styleUrl: './clase-en-vivo.component.scss'
})
// components/clases-en-vivo/clases-en-vivo.component.ts
export class ClaseEnVivoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos
  cursoId!: number;
  clases: ClaseEnVivoDTO[] = [];
  salas: SalaEnVivoDTO[] = [];
  clasesEnVivo: ClaseEnVivoDTO[] = [];
  
  // Estados UI
  loading = false;
  mostrarDialogoProgramar = false;
  mostrarDialogoDetalle = false;
  claseSeleccionada?: ClaseEnVivoDTO;
  
  // Formulario
  nuevaClase: ProgramarClaseRequest = {
    titulo: '',
    descripcion: '',
    fechaProgramada: '',
    duracionEstimadaMinutos: 60
  };
  salaSeleccionada?: SalaEnVivoDTO;
  
  // Filtros
  filtroEstado: EstadoClase | 'TODAS' = 'TODAS';
  filtroFecha: Date | null = null;
  
  // Enums para template
  EstadoClase = EstadoClase;
  
  // Opciones
  opcionesEstado = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Programadas', value: EstadoClase.PROGRAMADA },
    { label: 'En Vivo', value: EstadoClase.EN_VIVO },
    { label: 'Finalizadas', value: EstadoClase.FINALIZADA },
    { label: 'Canceladas', value: EstadoClase.CANCELADA }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public claseService: ClaseEnVivoService,
    private salaService: SalaEnVivoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.cursoId = +params['idCurso'];
      this.cargarDatos();
    });


    // Actualizar clases en vivo cada 30 segundos
    setInterval(() => this.cargarClasesEnVivo(), 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatos(): void {
    this.loading = true;
    
    forkJoin({
      clases: this.claseService.listarPorCurso(this.cursoId),
      salas: this.salaService.obtenerPorCurso(this.cursoId),
      clasesEnVivo: this.claseService.listarClasesEnVivo()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.clases = data.clases;
        this.salas = data.salas;
        this.clasesEnVivo = data.clasesEnVivo.filter(c => c.cursoId === this.cursoId);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos'
        });
        this.loading = false;
      }
    });
  }

  cargarClasesEnVivo(): void {
    this.claseService.listarClasesEnVivo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(clases => {
        this.clasesEnVivo = clases.filter(c => c.cursoId === this.cursoId);
      });
  }

  // Gestión de salas
  crearNuevaSala(): void {
    this.salaService.crearSala(this.cursoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sala) => {
          this.salas.push(sala);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sala creada correctamente'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la sala'
          });
        }
      });
  }

  // Programación de clases
  abrirDialogoProgramar(): void {
    if (this.salas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Primero debes crear una sala para programar clases'
      });
      return;
    }
    
    this.resetearFormulario();
    this.mostrarDialogoProgramar = true;
  }

  programarClase(): void {
    if (!this.validarFormulario()) return;
    
    this.loading = true;
    
    this.claseService.programarClase(this.nuevaClase, this.salaSeleccionada!.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clase) => {
          this.clases.push(clase);
          this.mostrarDialogoProgramar = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Clase programada correctamente'
          });
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al programar la clase'
          });
          this.loading = false;
        }
      });
  }

  // Gestión de clases
  iniciarTransmision(clase: ClaseEnVivoDTO): void {
    if (!this.claseService.puedeIniciarClase(clase)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La clase solo puede iniciarse 15 minutos antes o después de la hora programada'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas iniciar la transmisión?',
      header: 'Confirmar Inicio',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.claseService.iniciarTransmision(clase.cveClaseEnVivo!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (claseActualizada) => {
              this.actualizarClaseEnLista(claseActualizada);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transmisión iniciada'
              });
              
              // Navegar a la sala de transmisión
              this.router.navigate(['/clase-transmision', claseActualizada.cveClaseEnVivo]);
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al iniciar la transmisión'
              });
            }
          });
      }
    });
  }

  finalizarTransmision(clase: ClaseEnVivoDTO): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas finalizar la transmisión?',
      header: 'Confirmar Finalización',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.claseService.finalizarTransmision(clase.cveClaseEnVivo!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (claseActualizada) => {
              this.actualizarClaseEnLista(claseActualizada);
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transmisión finalizada'
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al finalizar la transmisión'
              });
            }
          });
      }
    });
  }

  reprogramarClase(clase: ClaseEnVivoDTO): void {
    // Implementar diálogo de reprogramación
    this.claseSeleccionada = clase;
    // Abrir diálogo específico para reprogramar
  }

  cancelarClase(clase: ClaseEnVivoDTO): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas cancelar esta clase?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.claseService.cancelarClase(clase.cveClaseEnVivo!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              clase.estado = EstadoClase.CANCELADA;
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Clase cancelada'
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cancelar la clase'
              });
            }
          });
      }
    });
  }

  // Navegación
  unirseAClase(clase: ClaseEnVivoDTO): void {
    this.router.navigate(['cursos/clase-vivo', clase.cveClaseEnVivo]);
  }

  verDetalle(clase: ClaseEnVivoDTO): void {
    this.claseSeleccionada = clase;
    this.mostrarDialogoDetalle = true;
  }

  // Utilidades
  get clasesFiltradas(): ClaseEnVivoDTO[] {
    let clasesFiltradas = [...this.clases];
    
    if (this.filtroEstado !== 'TODAS') {
      clasesFiltradas = clasesFiltradas.filter(c => c.estado === this.filtroEstado);
    }
    
    if (this.filtroFecha) {
      const fechaFiltro = this.filtroFecha.toISOString().split('T')[0];
      clasesFiltradas = clasesFiltradas.filter(c => 
        c.fechaProgramada.startsWith(fechaFiltro)
      );
    }
    
    return clasesFiltradas;
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

  private validarFormulario(): boolean {
    if (!this.nuevaClase.titulo.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El título es requerido'
      });
      return false;
    }
    
    if (!this.nuevaClase.fechaProgramada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La fecha programada es requerida'
      });
      return false;
    }
    
    if (!this.salaSeleccionada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debes seleccionar una sala'
      });
      return false;
    }
    
    return true;
  }

  private resetearFormulario(): void {
    this.nuevaClase = {
      titulo: '',
      descripcion: '',
      fechaProgramada: '',
      duracionEstimadaMinutos: 60
    };
    this.salaSeleccionada = undefined;
  }

  private actualizarClaseEnLista(claseActualizada: ClaseEnVivoDTO): void {
    const index = this.clases.findIndex(c => c.cveClaseEnVivo === claseActualizada.cveClaseEnVivo);
    if (index !== -1) {
      this.clases[index] = claseActualizada;
    }
  }
}
