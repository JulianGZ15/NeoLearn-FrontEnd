import { ClaseEnVivo } from './claseEnVivo.model';
import { Usuario } from './usuario.model';

export interface MensajeChat {
  cve_mensajeChat?: number;
  claseEnVivo?: ClaseEnVivo;
  usuario?: Usuario;
  contenido?: string;
  timestamp?: string; // ISO date-time string
}
