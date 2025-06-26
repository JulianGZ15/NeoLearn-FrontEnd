import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule],
  styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <div class="cta-text">
            <h2>¿Listo para revolucionar tu educación empresarial?</h2>
            <p>
              Únete a más de 500 empresas que ya confían en NeoLearn para 
              la formación privada de sus equipos. Comienza tu prueba gratuita hoy.
            </p>
          </div>
          
          <div class="cta-form">
            <div class="form-group">
              <input 
                type="email" 
                placeholder="Ingresa tu email empresarial"
                class="email-input"
              />
              <p-button 
                label="Comenzar Prueba Gratuita" 
                styleClass="btn-primary cta-btn"
                icon="pi pi-arrow-right">
              </p-button>
            </div>
            <p class="form-note">
              <i class="pi pi-shield"></i>
              Prueba gratuita por 14 días • No requiere tarjeta de crédito
            </p>
          </div>
        </div>
        
        <div class="cta-features">
          <div class="feature-item" *ngFor="let feature of features">
            <i [class]="feature.icon"></i>
            <span>{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta-section {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .cta-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
    }
    
    .container {
      position: relative;
      z-index: 1;
    }
    
    .cta-content {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .cta-text h2 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .cta-text p {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .form-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      margin-bottom: 1rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .email-input {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.9);
      color: var(--dark-color);
    }
    
    .email-input::placeholder {
      color: var(--gray-color);
    }
    
    .email-input:focus {
      outline: none;
      background: white;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }
    
    .cta-btn {
      padding: 12px 24px !important;
      background: var(--accent-color) !important;
      border: none !important;
      white-space: nowrap;
    }
    
    .cta-btn:hover {
      background: #DC2626 !important;
      transform: translateY(-2px);
    }
    
    .form-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .cta-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
      padding-top: 3rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
      justify-content: center;
    }
    
    .feature-item i {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
    }
    
    @media (max-width: 768px) {
      .cta-text h2 {
        font-size: 2rem;
      }
      
      .form-group {
        flex-direction: column;
        align-items: stretch;
      }
      
      .email-input {
        margin-bottom: 1rem;
      }
      
      .cta-features {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class CtaComponent {
  features = [
    {
      icon: 'pi pi-clock',
      text: 'Configuración en 5 minutos'
    },
    {
      icon: 'pi pi-users',
      text: 'Hasta 100 estudiantes gratis'
    },
    {
      icon: 'pi pi-headphones',
      text: 'Soporte especializado incluido'
    },
    {
      icon: 'pi pi-shield',
      text: 'Seguridad empresarial garantizada'
    }
  ];
}