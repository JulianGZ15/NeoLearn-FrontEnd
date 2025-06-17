import { Usuario } from './usuario.model';

export interface Notificacion {
  cve_notificacion?: number;
  usuario?: Usuario;
  mensaje?: string;
  leido?: boolean;
  fecha_envio?: string; // ISO date-time string
}
