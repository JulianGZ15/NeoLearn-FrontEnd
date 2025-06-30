import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { AddressComponents, NominatimResult, NominatimService } from '../../Services/nominatim.service';
import { RegisterService } from '../../Services/register.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../../dtos/usuario.dto';
import { EmpresaDTO } from '../../../dtos/empresa.dto';
import { StepPanel, StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { Panel, PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { userRegister } from '../../../dtos/register.dto';

// Validador personalizado para confirmar contraseña
function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StepperModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    CardModule,
    DividerModule,
    ToastModule,
    PanelModule,
    CheckboxModule,
    PasswordModule
    

  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  activeStep: number = 1;
  userForm!: FormGroup;
  passwordForm!: FormGroup;
  companyForm!: FormGroup;
  
  // Variables para autocompletar direcciones
  addressSuggestions: NominatimResult[] = [];
  showSuggestions: boolean = false;
  addressSearchSubject = new Subject<string>();
  isLoadingAddresses: boolean = false;
  selectedAddressComponents: AddressComponents | null = null;

  // Variables para contraseña
  acceptTerms: boolean = false;
  isSubmitting: boolean = false;

  tipoUsuarioOptions = [
    { label: 'Usuario Final', value: 'FINAL' },
    { label: 'Usuario Empresarial', value: 'EMPRESARIAL' }
  ];

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private nominatimService: NominatimService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.setupAddressSearch();
  }

  private initializeForms() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      tipo: ['', Validators.required],
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
      place_id: ['']
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });

    this.companyForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo_plan: ['']
    });
  }

  // Validador personalizado para fuerza de contraseña
  passwordStrengthValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return valid ? null : { weakPassword: true };
  }

  // Métodos para mostrar requisitos de contraseña
  getPasswordRequirementClass(requirement: string): string {
    const password = this.passwordForm.get('password')?.value || '';
    let isValid = false;

    switch (requirement) {
      case 'length':
        isValid = password.length >= 8;
        break;
      case 'uppercase':
        isValid = /[A-Z]/.test(password);
        break;
      case 'lowercase':
        isValid = /[a-z]/.test(password);
        break;
      case 'number':
        isValid = /[0-9]/.test(password);
        break;
      case 'special':
        isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        break;
    }

    return isValid ? 'text-green-600' : 'text-gray-500';
  }

  getPasswordRequirementIcon(requirement: string): string {
    const password = this.passwordForm.get('password')?.value || '';
    let isValid = false;

    switch (requirement) {
      case 'length':
        isValid = password.length >= 8;
        break;
      case 'uppercase':
        isValid = /[A-Z]/.test(password);
        break;
      case 'lowercase':
        isValid = /[a-z]/.test(password);
        break;
      case 'number':
        isValid = /[0-9]/.test(password);
        break;
      case 'special':
        isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        break;
    }

    return isValid ? 'pi pi-check-circle mr-2' : 'pi pi-circle mr-2';
  }

  getPasswordStrengthClass(): string {
    const password = this.passwordForm.get('password')?.value || '';
    const score = this.calculatePasswordStrength(password);
    
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPasswordStrengthText(): string {
    const password = this.passwordForm.get('password')?.value || '';
    const score = this.calculatePasswordStrength(password);
    
    if (score >= 4) return 'Fuerte';
    if (score >= 3) return 'Medio';
    return 'Débil';
  }

  private calculatePasswordStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    return score;
  }

  private setupAddressSearch() {
    this.addressSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 3) {
          return of([]);
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

  nextStep(activateCallback?: Function) {
    if (this.activeStep === 1 && this.userForm.valid && this.selectedAddressComponents) {
      this.activeStep = 2;
      if (activateCallback) activateCallback(2);
    } else if (this.activeStep === 2 && this.passwordForm.valid) {
      this.activeStep = 3;
      if (activateCallback) activateCallback(3);
    } else if (this.activeStep === 3 && this.companyForm.valid) {
      this.activeStep = 4;
      if (activateCallback) activateCallback(4);
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
      
      if (this.activeStep === 1 && !this.selectedAddressComponents) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Dirección requerida',
          detail: 'Por favor selecciona una dirección de las sugerencias'
        });
      }
    }
  }

  private getCurrentForm(): FormGroup {
    switch (this.activeStep) {
      case 1: return this.userForm;
      case 2: return this.passwordForm;
      case 3: return this.companyForm;
      default: return this.userForm;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  submitRegistration() {
    if (this.userForm.valid && this.passwordForm.valid && this.companyForm.valid && this.selectedAddressComponents && this.acceptTerms) {
      this.isSubmitting = true;
      
      const currentDate = new Date();
      const nextYear = new Date(currentDate);
      nextYear.setFullYear(currentDate.getFullYear() + 1);

      const { direccionInput, ...userFormData } = this.userForm.value;

      const usuarioDTO: userRegister = {
        ...userFormData,
        password: this.passwordForm.get('password')?.value,
        fecha_registro: currentDate.toISOString()
      };

      const empresaDTO: EmpresaDTO = {
        ...this.companyForm.value,
        fecha_inicio_plan: currentDate.toISOString(),
        fecha_fin_plan: nextYear.toISOString(),
        esta_activo: true,
        tipo_plan: ''
      };

      this.registerService.createUser(usuarioDTO, empresaDTO).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario registrado correctamente'
          });
          this.resetForms();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al registrar usuario'
          });
          console.error('Error:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  private resetForms() {
    this.userForm.reset();
    this.passwordForm.reset();
    this.companyForm.reset();
    this.activeStep = 1;
    this.selectedAddressComponents = null;
    this.showSuggestions = false;
    this.addressSuggestions = [];
    this.acceptTerms = false;
  }

  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.userForm.patchValue({ fotoperfil: file.name });
    }
  }
}