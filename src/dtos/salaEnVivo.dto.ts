import { ClaseEnVivoDTO } from "./claseEnVivo.dto";

export interface SalaEnVivoDTO {
  id?: number;
  codigoSala: string;
  cursoId: number;
  cursoNombre?: string;
  activa: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  clases?: ClaseEnVivoDTO[];
  participantes?: number[];
  totalParticipantes?: number;
}
