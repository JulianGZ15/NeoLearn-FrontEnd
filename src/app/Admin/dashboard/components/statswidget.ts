import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasEmpresaService } from '../../Services/estadisticas-empresa.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Cursos</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ cursosCount !== null ? cursosCount : 'Cargando...' }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-book text-blue-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium"></span>
            <span class="text-muted-color">Total de cursos</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Ganancias (mes actual)</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ gananciasMesActual !== null ? (gananciasMesActual | currency:'USD') : 'Cargando...' }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-dollar text-orange-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium"></span>
            <span class="text-muted-color">Ingresos este mes</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Suscripciones</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ suscripcionesCount !== null ? suscripcionesCount : 'Cargando...' }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-users text-cyan-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium"></span>
            <span class="text-muted-color">Total de suscripciones</span>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Estudiantes</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                        {{ estudiantesCount !== null ? estudiantesCount : 'Cargando...' }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-user text-purple-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium"></span>
            <span class="text-muted-color">Total de estudiantes</span>
        </div>
    </div>
    `
})
export class StatsWidget implements OnInit {
    cursosCount: number | null = null;
    gananciasMesActual: number | null = null;
    suscripcionesCount: number | null = null;
    estudiantesCount: number | null = null;

    constructor(private estadisticasService: EstadisticasEmpresaService) {}

    ngOnInit(): void {
        this.estadisticasService.contarCursosPorEmpresa().subscribe({
            next: (count) => this.cursosCount = count,
            error: () => this.cursosCount = 0
        });

        this.estadisticasService.calcularGananciasMesActual().subscribe({
            next: (ganancias) => this.gananciasMesActual = ganancias,
            error: () => this.gananciasMesActual = 0
        });

        this.estadisticasService.contarTotalSuscripciones().subscribe({
            next: (count) => this.suscripcionesCount = count,
            error: () => this.suscripcionesCount = 0
        });

        this.estadisticasService.contarEstudiantesEmpresa().subscribe({
            next: (count) => this.estudiantesCount = count,
            error: () => this.estudiantesCount = 0
        });
    }
}
