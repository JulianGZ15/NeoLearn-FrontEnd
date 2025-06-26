import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, StepsModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="section how-it-works">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">¿Cómo funciona NeoLearn?</h2>
          <p class="section-subtitle">
            Tres simples pasos para comenzar tu plataforma de educación privada
          </p>
        </div>
        
        <div class="steps-container">
          <div class="step-card" *ngFor="let step of steps; let i = index">
            <div class="step-number">
              {{ i + 1 }}
            </div>
            <div class="step-content">
              <div class="step-icon">
                <i [class]="step.icon"></i>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              <ul class="step-features">
                <li *ngFor="let feature of step.features">
                  <i class="pi pi-check"></i>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="process-visual">
          <div class="timeline">
            <div class="timeline-item" *ngFor="let item of timeline; let i = index">
              <div class="timeline-dot" [class.active]="i === 0">
                <i [class]="item.icon"></i>
              </div>
              <div class="timeline-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .how-it-works {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
    }
    
    .steps-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }
    
    .step-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      position: relative;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .step-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    }
    
    .step-number {
      position: absolute;
      top: -15px;
      left: 2rem;
      width: 30px;
      height: 30px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.875rem;
    }
    
    .step-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .step-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    .step-content p {
      color: var(--gray-color);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .step-features {
      list-style: none;
      padding: 0;
    }
    
    .step-features li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      color: var(--dark-color);
      font-size: 0.875rem;
    }
    
    .step-features i {
      color: var(--secondary-color);
      font-size: 0.75rem;
    }
    
    .process-visual {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: relative;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 24px;
      top: 24px;
      bottom: 24px;
      width: 2px;
      background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
    }
    
    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      position: relative;
    }
    
    .timeline-dot {
      width: 48px;
      height: 48px;
      background: #E5E7EB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-color);
      font-size: 1.25rem;
      flex-shrink: 0;
      z-index: 1;
      transition: all 0.3s ease;
    }
    
    .timeline-dot.active {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      transform: scale(1.1);
    }
    
    .timeline-content h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--dark-color);
    }
    
    .timeline-content p {
      color: var(--gray-color);
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .steps-container {
        grid-template-columns: 1fr;
      }
      
      .process-visual {
        padding: 2rem 1rem;
      }
      
      .timeline::before {
        left: 16px;
      }
      
      .timeline-dot {
        width: 32px;
        height: 32px;
        font-size: 1rem;
      }
    }
  `]
})
export class HowItWorksComponent {
  steps = [
    {
      icon: 'pi pi-building',
      title: 'Configura tu Empresa',
      description: 'Crea tu espacio empresarial con marca personalizada y configuraciones específicas para tu organización.',
      features: [
        'Branding personalizado',
        'Dominios propios',
        'Configuración de roles',
        'Integración con sistemas existentes'
      ]
    },
    {
      icon: 'pi pi-users',
      title: 'Invita a tus Estudiantes',
      description: 'Genera invitaciones seguras y controladas para que solo las personas autorizadas accedan a tus cursos.',
      features: [
        'Invitaciones por email',
        'Códigos de acceso únicos',
        'Control de expiración',
        'Gestión de permisos'
      ]
    },
    {
      icon: 'pi pi-play',
      title: 'Comienza a Enseñar',
      description: 'Lanza tus cursos y clases en vivo con todas las herramientas necesarias para una experiencia educativa completa.',
      features: [
        'Clases en tiempo real',
        'Contenido multimedia',
        'Evaluaciones interactivas',
        'Certificados automáticos'
      ]
    }
  ];

  timeline = [
    {
      icon: 'pi pi-user-plus',
      title: 'Registro de Empresa',
      description: 'El administrador crea la cuenta empresarial y configura los parámetros iniciales de la plataforma.'
    },
    {
      icon: 'pi pi-cog',
      title: 'Personalización',
      description: 'Se configura el branding, dominios, y se establecen las políticas de acceso y uso de la plataforma.'
    },
    {
      icon: 'pi pi-send',
      title: 'Invitaciones',
      description: 'Se generan y envían invitaciones seguras a los estudiantes seleccionados por la empresa.'
    },
    {
      icon: 'pi pi-graduation-cap',
      title: 'Educación Activa',
      description: 'Comienzan las clases, se imparten cursos y se realiza seguimiento del progreso de los estudiantes.'
    }
  ];
}