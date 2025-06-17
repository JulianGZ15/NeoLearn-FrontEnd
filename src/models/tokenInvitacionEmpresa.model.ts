import { Empresa } from './empresa.model';

export interface TokenInvitacionEmpresa {
  cveToken?: number;
  token?: string;
  empresa?: Empresa;
  fechaExpiracion?: string; // ISO date-time string
  usado?: boolean;
}
