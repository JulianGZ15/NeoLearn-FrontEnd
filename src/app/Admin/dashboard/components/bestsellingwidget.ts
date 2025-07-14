import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SuscripcionMensualDTO } from '../../../../dtos/suscripcionMensual.dto';
import { EstadisticasEmpresaService } from '../../Services/estadisticas-empresa.service';


@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Meses con más suscripciones</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        <ul class="list-none p-0 m-0">
            <li *ngFor="let sus of suscripciones" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">
                        {{ getMonthName(sus.mes) }} {{ sus.anio }}
                    </span>
                    <div class="mt-1 text-muted-color">Suscripciones</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div 
                            class="bg-primary-500 h-full" 
                            [ngStyle]="{ width: getPercentage(sus.totalSuscripciones) + '%' }">
                        </div>
                    </div>
                    <span class="text-primary ml-4 font-medium">{{ sus.totalSuscripciones }}</span>
                </div>
            </li>
            <li *ngIf="!suscripciones.length" class="text-center text-muted-color py-8">
                No hay datos de suscripciones mensuales.
            </li>
        </ul>
    </div>
    `
})
export class BestSellingWidget implements OnInit {
    suscripciones: SuscripcionMensualDTO[] = [];
    maxSuscripciones: number = 1;

    items = [
        { label: 'Actualizar', icon: 'pi pi-fw pi-refresh', command: () => this.cargarDatos() }
    ];

    constructor(private estadisticasService: EstadisticasEmpresaService) {}

    ngOnInit() {
        this.cargarDatos();
    }

    cargarDatos() {
        this.estadisticasService.obtenerSuscripcionesPorMes().subscribe({
            next: (data) => {
                // Ordena por totalSuscripciones descendente y toma los 6 meses con más suscripciones
                this.suscripciones = [...data]
                    .sort((a, b) => b.totalSuscripciones - a.totalSuscripciones)
                    .slice(0, 6);
                this.maxSuscripciones = this.suscripciones.length
                    ? Math.max(...this.suscripciones.map(s => s.totalSuscripciones))
                    : 1;
            },
            error: () => {
                this.suscripciones = [];
                this.maxSuscripciones = 1;
            }
        });
    }

    getMonthName(mes: number): string {
        // Devuelve el nombre del mes en español
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes';
    }

    getPercentage(valor: number): number {
        // Calcula el porcentaje de la barra de progreso
        return this.maxSuscripciones ? Math.round((valor / this.maxSuscripciones) * 100) : 0;
    }
}
