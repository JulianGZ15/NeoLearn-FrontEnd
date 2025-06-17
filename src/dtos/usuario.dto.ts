export interface UsuarioDTO {
  cveUsuario?: number;
  nombre?: string;
  correo?: string;
  tipo?: string; // Enum como string
  fecha_registro?: string; // ISO date string
}
