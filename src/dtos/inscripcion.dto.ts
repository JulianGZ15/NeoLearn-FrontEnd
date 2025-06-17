export interface InscripcionDTO {
  cveInscripcion?: number;
  usuarioId?: number;
  cursoId?: number;
  fecha_inscripcion?: string; // ISO date string
  precio_pagado?: number;
  metodo_pago?: string;
  estado?: string; // Enum como string
}
