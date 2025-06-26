import { EstadoClase } from "./estadoClase.enum";

export interface ClaseEnVivoDTO {
  cveClaseEnVivo: number;
  titulo: string;
  descripcion?: string;
  fechaProgramada: string;
  fechaInicio?: string;
  fechaFin?: string;
  salaId?: number;
  codigoSala?: string;
  instructorId?: number;
  instructorNombre?: string;
  estado?: EstadoClase;
  finalizada?: boolean;
  duracionEstimadaMinutos?: number;
  cursoId?: number;
  cursoNombre?: string;
}

export interface ProgramarClaseRequest {
  titulo: string;
  descripcion?: string;
  fechaProgramada: string;
  duracionEstimadaMinutos?: number;
}

export interface ClaseEnVivoResumen {
  cveClaseEnVivo: number;
  titulo: string;
  fechaProgramada: string;
  estado: EstadoClase;
  instructorNombre: string;
  codigoSala: string;
  duracionEstimadaMinutos?: number;
}

export interface ReprogramarClaseRequest {
  nuevaFecha: string;
}