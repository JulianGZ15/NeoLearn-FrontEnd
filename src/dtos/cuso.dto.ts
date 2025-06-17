export interface CursoDTO {
  cveCurso?: number;
  empresaId?: number;
  titulo?: string;
  descripcion?: string;
  precio?: number;
  es_gratis?: boolean;
  publico_objetivo?: string;
  fecha_publicacion?: string; // ISO date string
  estado?: string; // Enum como string
  portada?: string; // Nombre del archivo de la portada
}
