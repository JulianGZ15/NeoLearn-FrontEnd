import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <h3 class="text-gradient">NeoLearn</h3>
              <p>La plataforma de educación privada líder para empresas modernas.</p>
            </div>
            <div class="social-links">
              <a href="#" class="social-link">
                <i class="pi pi-twitter"></i>
              </a>
              <a href="#" class="social-link">
                <i class="pi pi-linkedin"></i>
              </a>
              <a href="#" class="social-link">
                <i class="pi pi-facebook"></i>
              </a>
              <a href="#" class="social-link">
                <i class="pi pi-instagram"></i>
              </a>
            </div>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>Producto</h4>
              <ul>
                <li><a href="#">Características</a></li>
                <li><a href="#">Precios</a></li>
                <li><a href="#">Integraciones</a></li>
                <li><a href="#">Seguridad</a></li>
              </ul>
            </div>
            
            <div class="link-group">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Nosotros</a></li>
                <li><a href="#">Carreras</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Prensa</a></li>
              </ul>
            </div>
            
            <div class="link-group">
              <h4>Recursos</h4>
              <ul>
                <li><a href="#">Documentación</a></li>
                <li><a href="#">Centro de Ayuda</a></li>
                <li><a href="#">Webinars</a></li>
                <li><a href="#">Casos de Uso</a></li>
              </ul>
            </div>
            
            <div class="link-group">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Chat en Vivo</a></li>
                <li><a href="#">Estado del Sistema</a></li>
                <li><a href="#">Comunidad</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p>&copy; 2025 NeoLearn. Todos los derechos reservados.</p>
            <div class="footer-legal">
              <a href="#">Términos de Servicio</a>
              <a href="#">Política de Privacidad</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--dark-color);
      color: white;
      padding: 4rem 0 2rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 4rem;
      margin-bottom: 3rem;
    }
    
    .footer-section h3 {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }
    
    .footer-section p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
    }
    
    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      background: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .footer-links {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }
    
    .link-group h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: white;
    }
    
    .link-group ul {
      list-style: none;
      padding: 0;
    }
    
    .link-group li {
      margin-bottom: 0.75rem;
    }
    
    .link-group a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .link-group a:hover {
      color: white;
    }
    
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
    }
    
    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-bottom p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
    
    .footer-legal {
      display: flex;
      gap: 2rem;
    }
    
    .footer-legal a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.3s ease;
    }
    
    .footer-legal a:hover {
      color: white;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .footer-links {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
      
      .footer-bottom-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .footer-legal {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {}