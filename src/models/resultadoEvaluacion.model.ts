import { Evaluacion } from './evaluacion.model';
import { Usuario } from './usuario.model';

export interface ResultadoEvaluacion {
  cveResultadoEvaluacion?: number;
  evaluacion?: Evaluacion;
  usuario?: Usuario;
  calificacion?: number;
  fecha?: string; // ISO date-time string
}
