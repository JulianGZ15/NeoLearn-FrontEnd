import { Empresa } from './empresa.model';

export enum TipoUsuario {
  EMPRESARIAL = 'EMPRESARIAL',
  FINAL = 'FINAL'
}

export interface Usuario {
  cveUsuario?: number;
  nombre?: string;
  correo?: string;
  contrasena?: string;
  tipo?: TipoUsuario;
  empresas?: Empresa[];
  fecha_registro?: string; // ISO date string
}
