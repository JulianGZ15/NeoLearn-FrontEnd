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
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CuponDTO } from '../../../../dtos/cupon.dto';
import { CuponService } from '../../Services/cupones.service';



@Component({
  selector: 'app-cupones',
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
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './cupones.component.html',
  styleUrl: './cupones.component.scss'
})
export class CuponesComponent implements OnInit {
  idCurso!: number;
  cupones: CuponDTO[] = [];
  cuponDialog = false;
  cupon: CuponDTO = this.nuevoCupon();
  selectedCupones: CuponDTO[] = [];
  submitted = false;
  cols: any[] = [];
  exportColumns: any[] = [];

  @ViewChild('dt') dt!: Table;

  constructor(
    private route: ActivatedRoute,
    private cuponService: CuponService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'cveCupon', header: 'ID' },
      { field: 'codigo', header: 'Código' },
      { field: 'descuento_porcentaje', header: '% Descuento' },
      { field: 'descuento_fijo', header: 'Descuento Fijo' },
      { field: 'fecha_inicio', header: 'Inicio' },
      { field: 'fecha_fin', header: 'Fin' },
      { field: 'usos_disponibles', header: 'Usos' }
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));

    this.route.paramMap.subscribe(params => {
      this.idCurso = Number(params.get('idCurso'));
      this.loadCupones();
    });
  }

  loadCupones() {
    this.cuponService.listarCupones(this.idCurso).subscribe({
      next: (data) => this.cupones = data,
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los cupones',
        life: 3000
      })
    });
  }

  nuevoCupon(): CuponDTO {
    return {
      cveCurso: this.idCurso,
      codigo: '',
      descuento_porcentaje: 0,
      descuento_fijo: 0,
      fecha_inicio: '',
      fecha_fin: '',
      usos_disponibles: 0
    };
  }

openNew() {
  this.cupon = this.nuevoCupon();
  this.submitted = false;
  this.cuponDialog = true;
}


  editCupon(cupon: CuponDTO) {
    this.cupon = { ...cupon };
    this.cuponDialog = true;
  }

  deleteSelectedCupones() {
    if (!this.selectedCupones.length) return;
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar los cupones seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        Promise.all(
          this.selectedCupones.map(c => this.cuponService.eliminarCupon(c.cveCupon!).toPromise())
        ).then(() => {
          this.loadCupones();
          this.selectedCupones = [];
          this.messageService.add({
            severity: 'success',
            summary: 'Completado',
            detail: 'Cupones eliminados',
            life: 3000
          });
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar todos los cupones',
            life: 3000
          });
        });
      }
    });
  }

  deleteCupon(cupon: CuponDTO) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el cupón ID ${cupon.cveCupon}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cuponService.eliminarCupon(cupon.cveCupon!).subscribe({
          next: () => {
            this.loadCupones();
            this.messageService.add({
              severity: 'success',
              summary: 'Completado',
              detail: 'Cupón eliminado',
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el cupón',
              life: 3000
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.cuponDialog = false;
    this.submitted = false;
  }

 saveCupon() {
  this.submitted = true;
  
  // Ejecutar validaciones
  if (!this.validarCupon()) {
    return;
  }

  // Formatear fechas si son objetos Date
  if (this.isDate(this.cupon.fecha_inicio)) {
    this.cupon.fecha_inicio = this.formatDate(this.cupon.fecha_inicio as Date);
  }
  if (this.isDate(this.cupon.fecha_fin)) {
    this.cupon.fecha_fin = this.formatDate(this.cupon.fecha_fin as Date);
  }

  // Lógica de guardado/actualización
  if (this.cupon.cveCupon) {
    // Actualizar cupón existente
    this.cuponService.actualizarCupon(this.cupon.cveCupon, this.cupon).subscribe({
      next: () => {
        this.loadCupones();
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: 'Cupón actualizado correctamente',
          life: 3000
        });
        this.cuponDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el cupón',
          life: 3000
        });
      }
    });
  } else {
    // Crear nuevo cupón
    this.cuponService.crearCupon(this.idCurso, this.cupon).subscribe({
      next: () => {
        this.loadCupones();
        this.messageService.add({
          severity: 'success',
          summary: 'Completado',
          detail: 'Cupón creado correctamente',
          life: 3000
        });
        this.cuponDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el cupón',
          life: 3000
        });
      }
    });
  }
  
  console.log('Cupón guardado:', this.cupon);
  this.cupon = this.nuevoCupon();
}


  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10); // yyyy-MM-dd
  }

  isDate(value: any): value is Date {
    return Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime());
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Método que se ejecuta cuando cambia el descuento porcentual
onPorcentajeChange(event: any): void {
  const value = event.value || 0;
  
  if (value > 0) {
    // Si hay descuento porcentual, limpiar el descuento fijo
    this.cupon.descuento_fijo = 0;
  }
}

// Método que se ejecuta cuando cambia el descuento fijo
onDescuentoFijoChange(event: any): void {
  const value = event.value || 0;
  
  if (value > 0) {
    // Si hay descuento fijo, limpiar el descuento porcentual
    this.cupon.descuento_porcentaje = 0;
  }
}

// Método de validación mejorado
private validarCupon(): boolean {
  // Validar código obligatorio
  if (!this.cupon.codigo?.trim()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El código del cupón es obligatorio'
    });
    return false;
  }

  // Validar que al menos uno de los descuentos esté configurado
  if (!this.cupon.descuento_porcentaje && !this.cupon.descuento_fijo) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe configurar al menos un tipo de descuento (porcentual o fijo)'
    });
    return false;
  }

  // Validar rangos del descuento porcentual
  if (this.cupon.descuento_porcentaje && (this.cupon.descuento_porcentaje < 0 || this.cupon.descuento_porcentaje > 100)) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El descuento porcentual debe estar entre 0% y 100%'
    });
    return false;
  }

  // Validar que el descuento fijo no sea negativo
  if (this.cupon.descuento_fijo && this.cupon.descuento_fijo < 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El descuento fijo no puede ser negativo'
    });
    return false;
  }

  // Validar usos disponibles
  if (this.cupon.usos_disponibles < 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Los usos disponibles no pueden ser negativos'
    });
    return false;
  }

  return true;
}
}