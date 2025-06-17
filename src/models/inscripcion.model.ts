import { Usuario } from './usuario.model';
import { Curso } from './curso.model';

export enum EstadoInscripcion {
  ACTIVA = 'ACTIVA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA'
}

export interface Inscripcion {
  cveInscripcion?: number;
  usuario?: Usuario;
  curso?: Curso;
  fecha_inscripcion?: string; // ISO date string
  precio_pagado?: number;
  metodo_pago?: string;
  estado?: EstadoInscripcion;
}
