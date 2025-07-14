import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { filter } from 'rxjs';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];
  idCurso: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.idCurso = this.getCursoIdFromRoute();
      this.updateMenu(this.router.url);
    });

    this.idCurso = this.getCursoIdFromRoute();
    this.updateMenu(this.router.url);
  }

  getCursoIdFromRoute(): string | null {
    // Busca el parámetro idCurso en la ruta activa o sus padres
    let route = this.route.root;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.paramMap.has('idCurso')) {
        return route.snapshot.paramMap.get('idCurso');
      }
    }
    return null;
  }

  updateMenu(url: string) {
    if (url.startsWith('/start')) {
      this.model = [
        {
          label: 'Home',
          items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/start/dashboard'] }]
        },
        {
          label: 'Funciones',
          items: [
            { label: 'Cursos', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/start/cursos'] },
            { label: 'Invitaciones', icon: 'pi pi-fw pi-inbox', routerLink: ['/start/invitaciones'] },
            { label: 'Configuracion Certificados', icon: 'pi pi-fw pi-file-edit', routerLink: ['/start/configuracion-certificados'] },




          ]
        }
      ];
    } else if (url.startsWith('/cursos') && this.idCurso) {
      this.model = [
        {
          label: 'Videos',
          items: [
            { label: 'Videos', icon: 'pi pi-fw pi-video', routerLink: [`/cursos/videos/${this.idCurso}`] },
          ]
        },
        {
          label: 'Evaluaciones',
          items: [
            { label: 'Evaluaciones', icon: 'pi pi-fw pi-question', routerLink: [`/cursos/evaluaciones/${this.idCurso}`] },
          ]
        },
        {
          label: 'Inscripciones',
          items: [
            { label: 'Inscripciones', icon: 'pi pi-fw pi-users', routerLink: [`/cursos/suscripciones/${this.idCurso}`] },
          ]
        },
        {
          label: 'Preguntas',
          items: [
            { label: 'Preguntas', icon: 'pi pi-fw pi-question', routerLink: [`/cursos/preguntas/${this.idCurso}`] },
          ]
        },
        {
          label: 'Clases en Vivo',
          items: [
            { label: 'Clases en Vivo', icon: 'pi pi-fw pi-video', routerLink: [`/cursos/clase-en-vivo/${this.idCurso}`] },
          ]
        },
        {
          label: 'Cupones',
          items: [
            { label: 'Cupones', icon: 'pi pi-fw pi-tags', routerLink: [`/cursos/cupones/${this.idCurso}`] },
          ]
        },
        {
          label: 'Ayuda',
          items: [
            { label: 'Soporte', icon: 'pi pi-fw pi-info-circle', routerLink: ['/cursos/soporte'] }
          ]
        }
      ];
    } else {
      this.model = [
        {
          label: 'Inicio',
          items: [{ label: 'Login', icon: 'pi pi-fw pi-arrow-left', routerLink: ['/'] }]
        }
      ];
    }
  }
}
