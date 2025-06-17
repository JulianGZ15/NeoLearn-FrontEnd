export interface NotificacionDTO {
  cve_notificacion?: number;
  usuarioId?: number;
  mensaje?: string;
  leido?: boolean;
  fecha_envio?: string; // ISO date-time string
}
