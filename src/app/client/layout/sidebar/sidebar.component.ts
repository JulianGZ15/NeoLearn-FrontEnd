import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressBar } from 'primeng/progressbar';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  routerLink: string | any[];
  active?: boolean;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar-client',
  standalone: true,
  imports: [
    PanelModule,
    MenuModule,
    CommonModule,
    PanelMenuModule,
    ProgressBar,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isVisible = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  isMobile = false;
  overallProgress = 68;
  cursoId: string | null = null;

  learningMenuItems: NavItem[] = [];
  exploreMenuItems: NavItem[] = [];
  toolsMenuItems: NavItem[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.checkScreenSize();

    // Detectar cambios en parámetros de la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cursoId = this.getCursoIdFromRoute();
        this.updateMenu(this.router.url, this.cursoId);
      });

    // Inicialización directa
    this.cursoId = this.getCursoIdFromRoute();
    this.updateMenu(this.router.url, this.cursoId);
  }

  private getCursoIdFromRoute(): string | null {
    let route = this.route.root;
    while (route.firstChild) {
      route = route.firstChild;
      const cursoId = route.snapshot.paramMap.get('id') || route.snapshot.paramMap.get('cursoId');
      if (cursoId) {
        return cursoId;
      } 
    }
    return null;
  }

  private updateMenu(url: string, cursoId: string | null) {
    if (url.startsWith('/client/dashboard')) {
      this.learningMenuItems = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: ['/client/dashboard']
        },
        {
          label: 'Mis Cursos',
          icon: 'pi pi-book',
          routerLink: ['/client/my-courses'],
          badge: '3',
          badgeClass: 'badge-primary'
        }
      ];

      this.exploreMenuItems = [
        {
          label: 'Explorar Cursos',
          icon: 'pi pi-search',
          routerLink: ['/client/courses/browse']
        }
      ];

      this.toolsMenuItems = [
        {
          label: 'Certificados',
          icon: 'pi pi-verified',
          routerLink: ['/client/certificates']
        }
      ];
    } else if (url.startsWith(`/client/curso/`)) {
      this.learningMenuItems = [
        {
          label: 'Videos',
          icon: 'pi pi-play',
          routerLink: [`/client/curso/videos/${this.cursoId}`],
          badge: '2',
          badgeClass: 'badge-success'
        },
        {
          label: 'Preguntas',
          icon: 'pi pi-question',
          routerLink: [`/client/curso/preguntas/${this.cursoId}`],
          badge: '2',
          badgeClass: 'badge-success'
        },
        {
          label: 'Clases en Vivo',
          icon: 'pi pi-video',
          routerLink: [`/client/curso/clases/${this.cursoId}`],
          badge: '2',
          badgeClass: 'badge-success'
        },
        {
          label: 'Evaluaciones',
          icon: 'pi pi-file-edit',
          routerLink: [`/client/curso/${this.cursoId}/evaluaciones`],
        }
      ];

      this.toolsMenuItems = [
        {
          label: 'Certificados',
          icon: 'pi pi-verified',
          routerLink: ['/client/curso', cursoId, 'certificates']
        }
      ];

      this.exploreMenuItems = []; // Vaciar si no aplica
    } else {
      // Ruta desconocida o fallback
      this.learningMenuItems = [];
      this.exploreMenuItems = [];
      this.toolsMenuItems = [];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.toggleSidebar.emit();
    }
  }
}
