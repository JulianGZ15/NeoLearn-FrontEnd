import { Inscripcion } from './inscripcion.model';

export interface Certificado {
  cve_certificado?: number;
  inscripcion?: Inscripcion;
  url_pdf?: string;
  fecha_emision?: string; // ISO date string
}
