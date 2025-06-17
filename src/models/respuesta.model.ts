import { Pregunta } from './pregunta.model';
import { Usuario } from './usuario.model';

export interface Respuesta {
  cveRespuesta?: number;
  pregunta?: Pregunta;
  usuario?: Usuario;
  contenido?: string;
  fecha?: string; // ISO date-time string
}
