export interface CertificadoDTO {
  cve_certificado?: number;
  inscripcionId?: number;
  nombreArchivo?: string;
  fecha_emision?: string; // ISO date string
  // Datos adicionales que podrías necesitar mostrar
  nombreUsuario?: string;
  tituloUsuario?: string;
  nombreCurso?: string;
}
