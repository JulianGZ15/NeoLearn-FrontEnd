export interface ClaseEnVivoDTO {
  cve_claseEnVivo?: number;
  cursoId?: number;
  titulo?: string;
  descripcion?: string;
  fecha_programada?: string; // ISO date-time string
  duracion_minutos?: number;
  url_transmision?: string;
  grabacion_disponible?: boolean;
}
