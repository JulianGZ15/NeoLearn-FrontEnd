import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UsuarioDTO } from '../../../dtos/usuario.dto';
import { EmpresaDTO } from '../../../dtos/empresa.dto';
import { AddressComponents, NominatimResult, NominatimService } from '../../Services/nominatim.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { UsuarioService } from '../../Services/usuario.service';
import { EmpresaService } from '../../Services/empresa.service';

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabViewModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    ToastModule,
    DividerModule,
    SkeletonModule,
    TagModule,
    AvatarModule,
    ConfirmDialogModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  
  // Forms
  userForm!: FormGroup;
  companyForm!: FormGroup;
  
  // Data
  usuario: UsuarioDTO | null = null;
  empresas: EmpresaDTO[] = [];
  selectedEmpresa: EmpresaDTO | null = null;
  
  // UI States
  isLoadingUser = true;
  isLoadingCompanies = true;
  isSavingUser = false;
  isSavingCompany = false;
  isEditingUser = false;
  isEditingCompany = false;
  
  // Address autocomplete
  addressSuggestions: NominatimResult[] = [];
  showSuggestions = false;
  addressSearchSubject = new Subject<string>();
  isLoadingAddresses = false;
  selectedAddressComponents: AddressComponents | null = null;
  
  // Options
  tipoUsuarioOptions = [
    { label: 'Usuario Final', value: 'FINAL' },
    { label: 'Usuario Empresarial', value: 'EMPRESARIAL' }
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private nominatimService: NominatimService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserData();
    this.setupAddressSearch();
  }

  private initializeForms() {
    this.userForm = this.fb.group({
      cveUsuario: [{value: '', disabled: true}],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      tipo: [{value: '', disabled: true}],
      fotoperfil: [''],
      // Campos de dirección
      direccionInput: [''],
      direccion_completa: [''],
      calle: [''],
      colonia: [''],
      ciudad: [''],
      estado: [''],
      codigo_postal: [''],
      pais: [''],
      latitud: [0],
      longitud: [0],
      place_id: [''],
      fecha_registro: [{value: '', disabled: true}]
    });

    this.companyForm = this.fb.group({
      cveEmpresa: [{value: '', disabled: true}],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo_plan: [{value: '', disabled: true}],
      fecha_inicio_plan: [{value: '', disabled: true}],
      fecha_fin_plan: [{value: '', disabled: true}],
      esta_activo: [{value: '', disabled: true}]
    });
  }

  private loadUserData() {
    this.isLoadingUser = true;
    this.isLoadingCompanies = true;

    this.usuarioService.obtenerUsuario().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.populateUserForm(usuario);
        this.isLoadingUser = false;
        
        // Cargar empresas del usuario
        if (usuario.cveUsuario) {
          this.loadUserCompanies(usuario.cveUsuario);
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del usuario'
        });
        this.isLoadingUser = false;
        this.isLoadingCompanies = false;
      }
    });
  }

  private loadUserCompanies(userId: number) {
    this.empresaService.obtenerEmpresasPorUsuario(userId).subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        if (empresas.length > 0) {
          this.selectedEmpresa = empresas[0];
          this.populateCompanyForm(empresas[0]);
        }
        this.isLoadingCompanies = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las empresas'
        });
        this.isLoadingCompanies = false;
      }
    });
  }

  private populateUserForm(usuario: UsuarioDTO) {
    this.userForm.patchValue({
      ...usuario,
      direccionInput: usuario.direccion_completa
    });

    if (usuario.direccion_completa) {
      this.selectedAddressComponents = {
        direccion_completa: usuario.direccion_completa || '',
        calle: usuario.calle || '',
        colonia: usuario.colonia || '',
        ciudad: usuario.ciudad || '',
        estado: usuario.estado || '',
        codigo_postal: usuario.codigo_postal || '',
        pais: usuario.pais || '',
        latitud: usuario.latitud || 0,
        longitud: usuario.longitud || 0,
        place_id: usuario.place_id || ''
      };
    }
  }

  private populateCompanyForm(empresa: EmpresaDTO) {
    this.companyForm.patchValue(empresa);
  }

  // Address autocomplete setup
  private setupAddressSearch() {
    this.addressSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 3) {
          return [];
        }
        this.isLoadingAddresses = true;
        return this.nominatimService.searchAddresses(query);
      })
    ).subscribe({
      next: (results) => {
        this.addressSuggestions = results;
        this.showSuggestions = results.length > 0;
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error searching addresses:', error);
        this.isLoadingAddresses = false;
        this.showSuggestions = false;
      }
    });
  }

  onAddressInput(event: any) {
    const query = event.target.value;
    if (query && query.length >= 3) {
      this.addressSearchSubject.next(query);
    } else {
      this.showSuggestions = false;
      this.addressSuggestions = [];
    }
  }

  selectAddress(result: NominatimResult) {
    const addressComponents = this.nominatimService.extractAddressComponents(result);
    this.selectedAddressComponents = addressComponents;
    
    this.userForm.patchValue({
      direccionInput: result.display_name,
      direccion_completa: addressComponents.direccion_completa,
      calle: addressComponents.calle,
      colonia: addressComponents.colonia,
      ciudad: addressComponents.ciudad,
      estado: addressComponents.estado,
      codigo_postal: addressComponents.codigo_postal,
      pais: addressComponents.pais,
      latitud: addressComponents.latitud,
      longitud: addressComponents.longitud,
      place_id: addressComponents.place_id
    });

    this.showSuggestions = false;
    this.addressSuggestions = [];
  }

  // Edit modes
  toggleUserEdit() {
    this.isEditingUser = !this.isEditingUser;
    if (!this.isEditingUser && this.usuario) {
      this.populateUserForm(this.usuario); // Reset form
    }
  }

  toggleCompanyEdit() {
    this.isEditingCompany = !this.isEditingCompany;
    if (!this.isEditingCompany && this.selectedEmpresa) {
      this.populateCompanyForm(this.selectedEmpresa); // Reset form
    }
  }

  // Save methods
  saveUserChanges() {
    if (this.userForm.valid) {
      this.confirmationService.confirm({
        message: '¿Estás seguro de que deseas guardar los cambios en tu perfil?',
        header: 'Confirmar cambios',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.isSavingUser = true;
          
          const { direccionInput, ...userData } = this.userForm.getRawValue();
          const updatedUser: UsuarioDTO = userData;

          this.usuarioService.actualizarUsuario(updatedUser).subscribe({
            next: (response) => {
              this.usuario = response;
              this.isEditingUser = false;
              this.isSavingUser = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Perfil actualizado correctamente'
              });
            },
            error: (error) => {
              console.error('Error updating user:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el perfil'
              });
              this.isSavingUser = false;
            }
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  saveCompanyChanges() {
    if (this.companyForm.valid && this.selectedEmpresa?.cveEmpresa) {
      this.confirmationService.confirm({
        message: '¿Estás seguro de que deseas guardar los cambios en la empresa?',
        header: 'Confirmar cambios',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.isSavingCompany = true;
          
          const companyData = this.companyForm.getRawValue();
          const updatedCompany: EmpresaDTO = {
            ...this.selectedEmpresa,
            nombre: companyData.nombre
          };

          this.empresaService.actualizarEmpresa(this.selectedEmpresa!.cveEmpresa!, updatedCompany).subscribe({
            next: (response) => {
              this.selectedEmpresa = response;
              // Actualizar en la lista
              const index = this.empresas.findIndex(e => e.cveEmpresa === response.cveEmpresa);
              if (index !== -1) {
                this.empresas[index] = response;
              }
              this.isEditingCompany = false;
              this.isSavingCompany = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empresa actualizada correctamente'
              });
            },
            error: (error) => {
              console.error('Error updating company:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar la empresa'
              });
              this.isSavingCompany = false;
            }
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.companyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Company selection
  selectCompany(empresa: EmpresaDTO) {
    this.selectedEmpresa = empresa;
    this.populateCompanyForm(empresa);
    this.isEditingCompany = false;
  }

  // File upload
  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.userForm.patchValue({ fotoperfil: file.name });
    }
  }

  // Utility methods
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getStatusSeverity(isActive: boolean | undefined): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Activa' : 'Inactiva';
  }

  getPlanSeverity(plan: string | undefined): string {
    switch (plan) {
      case 'PRIVADO': return 'info';
      case 'VENTA_PUBLICA': return 'success';
      default: return 'secondary';
    }
  }

  getUserInitials(nombre: string | undefined): string {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}