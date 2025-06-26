export interface SalaEstadoResponse {
  id: number;
  codigoSala: string;
  activa: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  totalParticipantes: number;
}