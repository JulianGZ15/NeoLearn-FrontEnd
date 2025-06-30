import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfiguracionDTO } from '../../../dtos/configuracion.dto';
import { FileUpload } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfiguracionService } from '../../Services/configuracion-certificado.service';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion-certificados',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TabViewModule,
    FileUploadModule,
    ButtonModule,
    ImageModule,
    InputTextModule,
    InputGroupModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './configuracion-certificados.component.html',
  styleUrl: './configuracion-certificados.component.scss'
})
export class ConfiguracionCertificadosComponent implements OnInit {

  @ViewChild('logoUpload') logoUpload!: FileUpload;
  @ViewChild('firmaUpload') firmaUpload!: FileUpload;

  configuracion: ConfiguracionDTO = {};
  
  // Estados de carga
  cargandoConfiguracion = false;
  subiendoLogo = false;
  subiendoFirma = false;
  guardandoFirmante = false;

  // Archivos seleccionados
  logoSeleccionado: File | null = null;
  firmaSeleccionada: File | null = null;
  
  // Previews
  logoPreview: string | null = null;
  firmaPreview: string | null = null;
  
  // Datos del formulario
  nombreFirmante: string = '';
  
  // Fecha actual para preview
  fechaActual = new Date();

  constructor(
    private configuracionService: ConfiguracionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cargarConfiguracion();
  }

  /**
   * Carga la configuración actual
   */
  cargarConfiguracion() {
    this.cargandoConfiguracion = true;
    
    // Aquí deberías obtener el ID de la empresa del usuario actual
    const empresaId = this.obtenerEmpresaIdUsuarioActual();
    
    this.configuracionService.obtenerConfiguracion(empresaId).subscribe({
      next: (config) => {
        this.configuracion = config;
        this.nombreFirmante = config.firmante || '';
        this.cargandoConfiguracion = false;
      },
      error: (error) => {
        this.mostrarError('Error al cargar configuración', error.message);
        this.cargandoConfiguracion = false;
      }
    });
  }

  /**
   * Maneja la selección del logo
   */
  onLogoSelect(event: any) {
    const file = event.files[0];
    
    const validacion = this.configuracionService.validarArchivo(file);
    if (!validacion.valido) {
      this.mostrarError('Archivo inválido', validacion.error!);
      this.logoUpload.clear();
      return;
    }

    this.logoSeleccionado = file;
    this.generarPreview(file, 'logo');
  }

  /**
   * Maneja la selección de la firma
   */
  onFirmaSelect(event: any) {
    const file = event.files[0];
    
    const validacion = this.configuracionService.validarArchivo(file);
    if (!validacion.valido) {
      this.mostrarError('Archivo inválido', validacion.error!);
      this.firmaUpload.clear();
      return;
    }

    this.firmaSeleccionada = file;
    this.generarPreview(file, 'firma');
  }

  /**
   * Genera preview de la imagen
   */
  generarPreview(file: File, tipo: 'logo' | 'firma') {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (tipo === 'logo') {
        this.logoPreview = e.target.result;
      } else {
        this.firmaPreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Confirma y sube el logo
   */
  confirmarSubidaLogo() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea subir este logo?',
      header: 'Confirmar subida',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.subirLogo({ files: [this.logoSeleccionado] });
      }
    });
  }

  /**
   * Confirma y sube la firma
   */
  confirmarSubidaFirma() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea subir esta firma?',
      header: 'Confirmar subida',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.subirFirma({ files: [this.firmaSeleccionada] });
      }
    });
  }

/**
 * Sube el logo al servidor - CORREGIDO
 */
subirLogo(event: any) {
  if (!this.logoSeleccionado) return;

  this.subiendoLogo = true;
  
  this.configuracionService.subirLogo(this.logoSeleccionado).subscribe({
    next: (config) => {
      this.configuracion = config;
      
      // ✅ CORREGIDO: Limpiar previews y archivos seleccionados
      this.logoPreview = null;
      this.logoSeleccionado = null;
      this.logoUpload.clear();
      
      // ✅ NUEVO: Forzar recarga de la imagen desde el servidor
      setTimeout(() => {
        this.cargarImagenLogo();
      }, 500);
      
      this.subiendoLogo = false;
      this.mostrarExito('Logo subido correctamente');
    },
    error: (error) => {
      this.subiendoLogo = false;
      this.mostrarError('Error al subir logo', error.message);
    }
  });
}

/**
 * Sube la firma al servidor - CORREGIDO
 */
subirFirma(event: any) {
  if (!this.firmaSeleccionada) return;

  this.subiendoFirma = true;
  
  this.configuracionService.subirFirma(this.firmaSeleccionada).subscribe({
    next: (config) => {
      this.configuracion = config;
      
      // ✅ CORREGIDO: Limpiar previews y archivos seleccionados
      this.firmaPreview = null;
      this.firmaSeleccionada = null;
      this.firmaUpload.clear();
      
      // ✅ NUEVO: Forzar recarga de la imagen desde el servidor
      setTimeout(() => {
        this.cargarImagenFirma();
      }, 500);
      
      this.subiendoFirma = false;
      this.mostrarExito('Firma subida correctamente');
    },
    error: (error) => {
      this.subiendoFirma = false;
      this.mostrarError('Error al subir firma', error.message);
    }
  });
}

/**
 * Carga la imagen del logo desde el servidor
 */
private cargarImagenLogo() {
  if (this.configuracion.logo) {
    // Agregar timestamp para evitar cache del navegador
    const timestamp = new Date().getTime();
    const logoUrl = `${this.obtenerUrlLogo()}?t=${timestamp}`;
    
    // Verificar que la imagen se carga correctamente
    const img = new Image();
    img.onload = () => {
      // La imagen se cargó correctamente, actualizar la vista
      this.configuracion = { ...this.configuracion }; // Trigger change detection
    };
    img.src = logoUrl;
  }
}

/**
 * Carga la imagen de la firma desde el servidor
 */
private cargarImagenFirma() {
  if (this.configuracion.firma) {
    // Agregar timestamp para evitar cache del navegador
    const timestamp = new Date().getTime();
    const firmaUrl = `${this.obtenerUrlFirma()}?t=${timestamp}`;
    
    // Verificar que la imagen se carga correctamente
    const img = new Image();
    img.onload = () => {
      // La imagen se cargó correctamente, actualizar la vista
      this.configuracion = { ...this.configuracion }; // Trigger change detection
    };
    img.src = firmaUrl;
  }
}


  /**
   * Guarda el nombre del firmante
   */
  guardarFirmante() {
    if (!this.nombreFirmante.trim()) {
      this.mostrarError('Error', 'El nombre del firmante no puede estar vacío');
      return;
    }

    this.guardandoFirmante = true;
    
    this.configuracionService.guardarFirmante(this.nombreFirmante).subscribe({
      next: (config) => {
        this.configuracion = config;
        this.guardandoFirmante = false;
        this.mostrarExito('Firmante guardado correctamente');
      },
      error: (error) => {
        this.guardandoFirmante = false;
        this.mostrarError('Error al guardar firmante', error.message);
      }
    });
  }

  /**
   * Obtiene la URL del logo
   */
  obtenerUrlLogo(): string {
    if (!this.configuracion.logo) return '';
    return `http://localhost:8080/api/archivos/logo/${this.configuracion.logo}`;
  }

  /**
   * Obtiene la URL de la firma
   */
  obtenerUrlFirma(): string {
    if (!this.configuracion.firma) return '';
    return `http://localhost:8080/api/archivos/firma/${this.configuracion.firma}`;
  }

  /**
   * Obtiene el ID de la empresa del usuario actual
   * Este método debes implementarlo según tu lógica de autenticación
   */
  private obtenerEmpresaIdUsuarioActual(): number {
    // Implementa la lógica para obtener el ID de la empresa
    // Por ejemplo, desde el token JWT o desde un servicio de usuario
    return 1; // Placeholder
  }

  /**
   * Muestra mensaje de éxito
   */
  private mostrarExito(mensaje: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: mensaje,
      life: 3000
    });
  }

  /**
   * Muestra mensaje de error
   */
  private mostrarError(titulo: string, mensaje: string) {
    this.messageService.add({
      severity: 'error',
      summary: titulo,
      detail: mensaje,
      life: 5000
    });
  }
}