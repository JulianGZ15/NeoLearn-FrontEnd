import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ButtonModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section class="hero hero-bg">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title fade-in">
              Educación <span class="text-highlight">Privada</span> 
              para Empresas Modernas
            </h1>
            <p class="hero-subtitle fade-in">
              NeoLearn conecta empresas con estudiantes a través de cursos exclusivos y clases en vivo. 
              Solo por invitación, totalmente personalizado.
            </p>
            <div class="hero-actions fade-in">
              <p-button 
                label="Comenzar Demo Gratuito" 
                styleClass="btn-primary hero-btn"
                icon="pi pi-play">
              </p-button>
              <p-button 
                label="Ver Cómo Funciona" 
                styleClass="btn-secondary hero-btn-secondary"
                icon="pi pi-video">
              </p-button>
            </div>
            <div class="hero-stats fade-in">
              <div class="stat">
                <span class="stat-number">500+</span>
                <span class="stat-label">Empresas</span>
              </div>
              <div class="stat">
                <span class="stat-number">50K+</span>
                <span class="stat-label">Estudiantes</span>
              </div>
              <div class="stat">
                <span class="stat-number">1M+</span>
                <span class="stat-label">Clases Impartidas</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-card">
              <div class="demo-interface">
                <div class="demo-header">
                  <div class="demo-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="demo-title">NeoLearn Dashboard</span>
                </div>
                <div class="demo-content">
                  <div class="demo-course">
                    <div class="course-icon">
                      <i class="pi pi-graduation-cap"></i>
                    </div>
                    <div class="course-info">
                      <h4>Curso de Marketing Digital</h4>
                      <p>TechCorp • 24 estudiantes</p>
                      <div class="course-progress">
                        <div class="progress-bar"></div>
                      </div>
                    </div>
                    <span class="live-badge">En vivo</span>
                  </div>
                  <div class="demo-stats">
                    <div class="stat-item">
                      <i class="pi pi-users"></i>
                      <span>5 cursos activos</span>
                    </div>
                    <div class="stat-item">
                      <i class="pi pi-clock"></i>
                      <span>3 clases hoy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      padding-top: 80px;
    }
    
    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: white;
    }
    
    .text-highlight {
      background: linear-gradient(135deg, #FEF3C7, #FCD34D);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    
    .hero-btn-secondary {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      color: white !important;
      backdrop-filter: blur(10px);
    }
    
    .hero-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
    }
    
    .hero-stats {
      display: flex;
      gap: 2rem;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      color: white;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .hero-visual {
      display: flex;
      justify-content: center;
      position: relative;
    }
    
    .hero-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 100%;
    }
    
    .demo-interface {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .demo-header {
      background: #F8FAFC;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .demo-dots {
      display: flex;
      gap: 0.5rem;
    }
    
    .demo-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #CBD5E1;
    }
    
    .demo-dots span:first-child {
      background: #EF4444;
    }
    
    .demo-dots span:nth-child(2) {
      background: #F59E0B;
    }
    
    .demo-dots span:last-child {
      background: #10B981;
    }
    
    .demo-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-color);
    }
    
    .demo-content {
      padding: 1.5rem;
    }
    
    .demo-course {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #F8FAFC;
      border-radius: 12px;
      margin-bottom: 1rem;
      position: relative;
    }
    
    .course-icon {
      width: 48px;
      height: 48px;
      background: var(--primary-color);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }
    
    .course-info h4 {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }
    
    .course-info p {
      font-size: 0.75rem;
      color: var(--gray-color);
      margin: 0 0 0.5rem 0;
    }
    
    .course-progress {
      width: 100%;
      height: 4px;
      background: #E2E8F0;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .progress-bar {
      width: 65%;
      height: 100%;
      background: var(--secondary-color);
      border-radius: 2px;
    }
    
    .live-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #EF4444;
      color: white;
      font-size: 0.625rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .demo-stats {
      display: flex;
      gap: 1rem;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--gray-color);
    }
    
    .stat-item i {
      color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .hero-stats {
        justify-content: center;
      }
    }
  `]
})
export class HeroComponent {}