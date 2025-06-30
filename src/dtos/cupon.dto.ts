export interface CuponDTO {
    cveCupon?: number;
    cveCurso?: number;
    codigo?: string;
    descuento_porcentaje: number;
    descuento_fijo: number;
    fecha_inicio?: string; // ISO date string
    fecha_fin?: string; // ISO date string
    usos_disponibles: number;
}