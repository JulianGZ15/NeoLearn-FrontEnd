import { Curso } from './curso.model';
import { Usuario } from './usuario.model';

export interface Pregunta {
  cvePregunta?: number;
  curso?: Curso;
  usuario?: Usuario;
  contenido?: string;
  fecha?: string; // ISO date-time string
}
