export interface EmpresaDTO {
  cveEmpresa?: number;
  nombre?: string;
  tipo_plan?: string; // Enum como string
  fecha_inicio_plan?: string; // ISO date string
  fecha_fin_plan?: string;    // ISO date string
  esta_activo?: boolean;
}
