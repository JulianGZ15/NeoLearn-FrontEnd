import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { MenuItemContent, MenuModule } from 'primeng/menu';
import { Menubar } from 'primeng/menubar';
@Component({
  selector: 'app-header-client',
  imports: [
    MenuModule,
    Button,
    CommonModule,
    Avatar,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  notificationCount = 3;
  
  userProfile = {
    name: 'Juan Pérez',
    avatar: '',
    initials: 'JP'
  };

  profileMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      routerLink: '/profile'
    },
    {
      label: 'Mis Cursos',
      icon: 'pi pi-book',
      routerLink: '/my-courses'
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    },
    {
      separator: true
    },
    {
      label: 'Ayuda',
      icon: 'pi pi-question-circle',
      routerLink: '/help'
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  showNotifications() {
    // Implementar lógica de notificaciones
    console.log('Mostrar notificaciones');
  }

  logout() {
    // Implementar lógica de logout
    console.log('Cerrar sesión');
  }
}