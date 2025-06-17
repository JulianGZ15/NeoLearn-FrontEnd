export interface PreguntaEvaluacionDTO {
  cvePreguntaEvaluacion?: number;
  evaluacionId?: number;
  pregunta?: string;
  opcion_a?: string;
  opcion_b?: string;
  opcion_c?: string;
  opcion_d?: string;
  respuesta_correcta?: string; // string (1 char)
}
