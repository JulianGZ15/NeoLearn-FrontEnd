import { Curso } from './curso.model';

export interface Video {
  cveVideo?: number;
  curso?: Curso;
  titulo?: string;
  url?: string;
  duracion_minutos?: number;
  orden?: number;
}
