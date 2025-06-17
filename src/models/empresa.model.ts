import { Usuario } from './usuario.model';

export enum TipoPlan {
  PRIVADO = 'PRIVADO',
  VENTA_PUBLICA = 'VENTA_PUBLICA'
}

export interface Empresa {
  cveEmpresa?: number;
  usuarios?: Usuario[];
  nombre?: string;
  tipo_plan?: TipoPlan;
  fecha_inicio_plan?: string; // ISO date string
  fecha_fin_plan?: string;    // ISO date string
  esta_activo?: boolean;
}
