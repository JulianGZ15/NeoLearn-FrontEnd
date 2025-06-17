import { Empresa } from './empresa.model';

export enum EstadoCurso {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
  INACTIVO = 'INACTIVO'
}

export interface Curso {
  cveCurso?: number;
  empresa?: Empresa;
  titulo?: string;
  descripcion?: string;
  precio?: number;
  es_gratis?: boolean;
  publico_objetivo?: string;
  fecha_publicacion?: string; // ISO date string
  estado?: EstadoCurso;
}
