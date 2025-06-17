export interface PreguntaDTO {
  cvePregunta?: number;
  cveCurso?: number;
  cveUsuario?: number;
  contenido?: string;
  fecha?: string; // ISO date-time string
}
