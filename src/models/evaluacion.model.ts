import { Curso } from './curso.model';

export interface Evaluacion {
  cveEvaluacion?: number;
  curso?: Curso;
  titulo?: string;
  duracion_minutos?: number;
}
