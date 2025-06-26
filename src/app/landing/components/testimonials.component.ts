import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, CarouselModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="section testimonials">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Lo que dicen nuestros clientes</h2>
          <p class="section-subtitle">
            Empresas líderes confían en NeoLearn para la formación de sus equipos
          </p>
        </div>
        
        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let testimonial of testimonials">
            <div class="testimonial-content">
              <div class="stars">
                <i class="pi pi-star-fill" *ngFor="let star of [1,2,3,4,5]"></i>
              </div>
              <p class="quote">"{{ testimonial.quote }}"</p>
              <div class="author">
                <div class="author-avatar">
                  <span>{{ testimonial.author.charAt(0) }}</span>
                </div>
                <div class="author-info">
                  <h4>{{ testimonial.author }}</h4>
                  <p>{{ testimonial.role }} - {{ testimonial.company }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stat-item" *ngFor="let stat of stats">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-description">{{ stat.description }}</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials {
      background: var(--dark-color);
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .testimonials::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(5, 150, 105, 0.1));
    }
    
    .container {
      position: relative;
      z-index: 1;
    }
    
    .section-title {
      color: white;
    }
    
    .section-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }
    
    .testimonial-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }
    
    .testimonial-card:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.15);
    }
    
    .stars {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1rem;
      color: #FCD34D;
    }
    
    .quote {
      font-size: 1.125rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    
    .author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .author-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
    }
    
    .author-info h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
    }
    
    .author-info p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
      padding-top: 4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FEF3C7, #FCD34D);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .stat-description {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
    }
  `]
})
export class TestimonialsComponent {
  testimonials = [
    {
      quote: "NeoLearn transformó completamente nuestra capacitación empresarial. La posibilidad de tener cursos privados solo para nuestro equipo fue exactamente lo que necesitábamos.",
      author: "María González",
      role: "Directora de RRHH",
      company: "TechCorp"
    },
    {
      quote: "La calidad de las clases en vivo y las herramientas de interacción superaron nuestras expectativas. Nuestros empleados están más comprometidos que nunca.",
      author: "Carlos Rodríguez",
      role: "CEO",
      company: "InnovateX"
    },
    {
      quote: "El control de acceso por invitaciones nos da la seguridad que necesitamos para compartir información confidencial en nuestros programas de formación.",
      author: "Ana Martínez",
      role: "Gerente de Capacitación",
      company: "FinanceGroup"
    },
    {
      quote: "Las analíticas detalladas nos permiten hacer seguimiento preciso del progreso de cada empleado. Es increíblemente útil para nuestros programas de desarrollo.",
      author: "Luis Fernández",
      role: "Director de Operaciones",
      company: "LogisticsPro"
    }
  ];

  stats = [
    {
      number: "98%",
      label: "Satisfacción del Cliente",
      description: "De las empresas recomiendan NeoLearn"
    },
    {
      number: "5x",
      label: "Mayor Engagement",
      description: "Comparado con plataformas tradicionales"
    },
    {
      number: "24/7",
      label: "Soporte Técnico",
      description: "Asistencia especializada siempre disponible"
    },
    {
      number: "100%",
      label: "Tiempo de Actividad",
      description: "Plataforma confiable y estable"
    }
  ];
}