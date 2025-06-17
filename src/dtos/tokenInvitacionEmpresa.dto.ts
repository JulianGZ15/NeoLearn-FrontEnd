export interface TokenInvitacionEmpresaDTO {
  cveToken?: number;
  token?: string;
  empresaId?: number;
  fechaExpiracion?: string; // ISO date-time string
  fechaCreacion?: string; // ISO date-time string
  usado?: boolean;
}
