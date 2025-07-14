import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../layout/service/layout.service';
import { EstadisticasEmpresaService } from '../../Services/estadisticas-empresa.service';
import { CursoVendidoDTO } from '../../../../dtos/cursoVendido.dto';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, 
        CommonModule
    ],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Cursos Más Vendidos</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" *ngIf="chartData"></p-chart>
        <div *ngIf="!chartData" class="text-center py-8">Cargando datos...</div>
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any = null;
    chartOptions: any;
    subscription!: Subscription;
    dataSubscription!: Subscription;

    constructor(
        public layoutService: LayoutService,
        private estadisticasService: EstadisticasEmpresaService
    ) {}

    ngOnInit() {
        this.loadChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.loadChart();
        });
    }

    loadChart() {
        this.estadisticasService.encontrarCursosMasVendidos().subscribe({
            next: (cursos: CursoVendidoDTO[]) => this.initChart(cursos),
            error: () => this.chartData = null
        });
    }

    initChart(cursos: CursoVendidoDTO[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: cursos.map(c => c.titulo),
            datasets: [
                {
                    type: 'bar',
                    label: 'Inscripciones',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: cursos.map(c => c.totalInscripciones),
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Ingresos',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    data: cursos.map(c => c.totalIngresos),
                    barThickness: 32
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }
}
