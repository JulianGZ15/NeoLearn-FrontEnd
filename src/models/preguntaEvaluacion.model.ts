import { Evaluacion } from './evaluacion.model';

export interface PreguntaEvaluacion {
  cvePreguntaEvaluacion?: number;
  evaluacion?: Evaluacion;
  pregunta?: string;
  opcion_a?: string;
  opcion_b?: string;
  opcion_c?: string;
  opcion_d?: string;
  respuesta_correcta?: string; // Character en Java → string (1 char)
}
