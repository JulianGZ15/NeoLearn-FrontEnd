import { Curso } from './curso.model';

export interface ClaseEnVivo {
  cve_claseEnVivo?: number;
  curso?: Curso;
  titulo?: string;
  descripcion?: string;
  fecha_programada?: string; // ISO date-time string
  duracion_minutos?: number;
  url_transmision?: string;
  grabacion_disponible?: boolean;
}
