import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { UsuarioDTO } from '../../../dtos/usuario.dto';
import { EstadisticasEmpresaService } from '../../Services/estadisticas-empresa.service';


@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `
    <div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Últimos Suscriptores</div>
        <p-table [value]="usuarios" [paginator]="false" [rows]="5" responsiveLayout="scroll">
            <ng-template pTemplate="header">
                <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Ver</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-usuario>
                <tr>
                    <td>{{ usuario.nombre }}</td>
                    <td>{{ usuario.correo }}</td>
                    <td>
                        <button pButton pRipple type="button" icon="pi pi-search"
                            class="p-button p-component p-button-text p-button-icon-only"
                            [disabled]="!usuario.cveUsuario"
                            (click)="verUsuario(usuario)">
                        </button>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="5">No hay suscriptores recientes.</td>
                </tr>
            </ng-template>
        </p-table>
    </div>
    `
})
export class RecentSalesWidget implements OnInit {
    usuarios: UsuarioDTO[] = [];

    constructor(private estadisticasService: EstadisticasEmpresaService) {}

    ngOnInit() {
        this.estadisticasService.encontrarUltimosCincoSuscriptores().subscribe({
            next: (data) => this.usuarios = data,
            error: () => this.usuarios = []
        });
    }

    verUsuario(usuario: UsuarioDTO) {
        // Aquí puedes abrir un diálogo, navegar a detalles, etc.
        alert(`Usuario: ${usuario.nombre}\nCorreo: ${usuario.correo}`);
    }
}
