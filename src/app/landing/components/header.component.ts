import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenubarModule, RouterModule],
    styleUrl: './../landing_styles.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="header">
      <div class="container">
        <nav class="navbar">
          <div class="logo">
            <h2 class="text-gradient">NeoLearn</h2>
          </div>
          
          <div class="nav-menu desktop-menu">
            <a href="#inicio" class="nav-link">Inicio</a>
            <a href="#caracteristicas" class="nav-link">Características</a>
            <a href="#empresas" class="nav-link">Para Empresas</a>
            <a href="#estudiantes" class="nav-link">Para Estudiantes</a>
          </div>
          
          <div class="nav-actions">
            <p-button 
              label="Iniciar Sesión" 
              styleClass="p-button-text nav-login"
              size="small"
              [routerLink]="['/auth']">
            </p-button>
            <p-button 
              label="Registrate" 
              styleClass="btn-primary"
              size="small"
              [routerLink]="['/register']">
            </p-button>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(229, 231, 235, 0.5);
    }
    
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
    }
    
    .logo h2 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
    }
    
    .nav-menu {
      display: flex;
      gap: 2rem;
    }
    
    .nav-link {
      text-decoration: none;
      color: var(--dark-color);
      font-weight: 500;
      transition: color 0.3s ease;
      position: relative;
    }
    
    .nav-link:hover {
      color: var(--primary-color);
    }
    
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }
    
    .nav-link:hover::after {
      width: 100%;
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .nav-login {
      color: var(--gray-color) !important;
    }
    
    @media (max-width: 768px) {
      .desktop-menu {
        display: none;
      }
      
      .navbar {
        padding: 0.75rem 0;
      }
      
      .logo h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class HeaderComponent {}