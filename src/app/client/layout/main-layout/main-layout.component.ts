import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { filter, Subject, takeUntil } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    SidebarComponent,
    RouterOutlet,
    CommonModule,
    Breadcrumb,
    ProgressSpinner
],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarVisible = true;
  isLoading = false;
  showBreadcrumb = true;
  
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/dashboard'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Configurar sidebar según el tamaño de pantalla
    this.checkScreenSize();
    
    // Escuchar cambios de ruta para actualizar breadcrumb
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateBreadcrumb();
      });

    // Configurar responsive
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.sidebarVisible = false;
    } else {
      this.sidebarVisible = true;
    }
  }

  private updateBreadcrumb() {
    // Lógica para actualizar breadcrumb basado en la ruta actual
    const url = this.router.url;
    this.breadcrumbItems = [];

    if (url.includes('/dashboard')) {
      this.breadcrumbItems = [{ label: 'Dashboard' }];
    } else if (url.includes('/my-courses')) {
      this.breadcrumbItems = [
        { label: 'Mis Cursos', routerLink: '/my-courses' }
      ];
    } else if (url.includes('/course/')) {
      this.breadcrumbItems = [
        { label: 'Mis Cursos', routerLink: '/my-courses' },
        { label: 'Detalle del Curso' }
      ];
    }
    // Agregar más rutas según sea necesario
  }
}
