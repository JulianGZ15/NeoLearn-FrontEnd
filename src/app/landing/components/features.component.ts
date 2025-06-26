import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, CardModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <section id="caracteristicas" class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">¿Por qué elegir NeoLearn?</h2>
          <p class="section-subtitle">
            La plataforma de educación privada más avanzada para empresas que buscan 
            excelencia en la formación de sus equipos
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card card fade-in" *ngFor="let feature of features">
            <div class="icon-feature" [style.background]="feature.gradient">
              <i [class]="feature.icon"></i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
        
        <div class="feature-showcase">
          <div class="showcase-content">
            <div class="showcase-text">
              <h3>Clases en Vivo con Interacción Real</h3>
              <p>
                Conecta instructores y estudiantes en tiempo real con herramientas 
                de colaboración avanzadas, pizarras interactivas y chat en vivo.
              </p>
              <ul class="feature-list">
                <li><i class="pi pi-check"></i> Video conferencias HD</li>
                <li><i class="pi pi-check"></i> Pizarra colaborativa</li>
                <li><i class="pi pi-check"></i> Chat y Q&A en tiempo real</li>
                <li><i class="pi pi-check"></i> Grabación automática</li>
              </ul>
            </div>
            <div class="showcase-visual">
              <div class="live-class-demo">
                <div class="video-grid">
                  <div class="video-tile instructor">
                    <div class="video-content">
                      <i class="pi pi-user"></i>
                      <span>Instructor</span>
                    </div>
                    <div class="video-controls">
                      <i class="pi pi-microphone"></i>
                      <i class="pi pi-video"></i>
                    </div>
                  </div>
                  <div class="video-tile student">
                    <div class="video-content">
                      <i class="pi pi-users"></i>
                      <span>24 estudiantes</span>
                    </div>
                  </div>
                </div>
                <div class="class-controls">
                  <div class="control-group">
                    <button class="control-btn active">
                      <i class="pi pi-microphone"></i>
                    </button>
                    <button class="control-btn">
                      <i class="pi pi-video"></i>
                    </button>
                    <button class="control-btn">
                      <i class="pi pi-desktop"></i>
                    </button>
                  </div>
                  <div class="participants">
                    <i class="pi pi-users"></i>
                    <span>24 participantes</span>
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
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    .section-subtitle {
      font-size: 1.125rem;
      color: var(--gray-color);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }
    
    .feature-card {
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    .feature-card p {
      color: var(--gray-color);
      line-height: 1.6;
    }
    
    .feature-showcase {
      background: var(--light-color);
      border-radius: 20px;
      padding: 3rem;
      margin-top: 3rem;
    }
    
    .showcase-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    
    .showcase-text h3 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    .showcase-text p {
      color: var(--gray-color);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
    }
    
    .feature-list li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      color: var(--dark-color);
    }
    
    .feature-list i {
      color: var(--secondary-color);
      font-weight: bold;
    }
    
    .live-class-demo {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .video-grid {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .video-tile {
      flex: 1;
      background: #000;
      border-radius: 12px;
      aspect-ratio: 16/9;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1rem;
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .instructor {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    }
    
    .student {
      background: linear-gradient(135deg, #374151, #4B5563);
    }
    
    .video-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 0.5rem;
    }
    
    .video-content i {
      font-size: 2rem;
    }
    
    .video-controls {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .class-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #F8FAFC;
      border-radius: 12px;
    }
    
    .control-group {
      display: flex;
      gap: 0.5rem;
    }
    
    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .control-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .control-btn.active {
      background: var(--primary-color);
      color: white;
    }
    
    .participants {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gray-color);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .feature-showcase {
        padding: 2rem 1rem;
      }
      
      .showcase-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class FeaturesComponent {
  features = [
    {
      icon: 'pi pi-lock',
      title: 'Solo por Invitación',
      description: 'Control total sobre quién accede a tus cursos. Los estudiantes solo pueden unirse mediante invitaciones empresariales.',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      icon: 'pi pi-video',
      title: 'Clases en Vivo',
      description: 'Imparte clases interactivas en tiempo real con herramientas de colaboración avanzadas y grabación automática.',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Analytics Empresariales',
      description: 'Seguimiento detallado del progreso, asistencia y engagement de los estudiantes con reportes personalizados.',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)'
    },
    {
      icon: 'pi pi-shield',
      title: 'Seguridad Avanzada',
      description: 'Protección de datos de nivel empresarial con encriptación end-to-end y cumplimiento de normativas.',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)'
    },
    {
      icon: 'pi pi-cog',
      title: 'Personalización Total',
      description: 'Adapta la plataforma a tu marca con temas personalizados, dominios propios y configuraciones específicas.',
      gradient: 'linear-gradient(135deg, #fa709a, #fee140)'
    },
    {
      icon: 'pi pi-mobile',
      title: 'Multiplataforma',
      description: 'Acceso desde cualquier dispositivo con aplicaciones nativas para iOS, Android y acceso web completo.',
      gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)'
    }
  ];
}