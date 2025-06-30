export interface userRegister {
  cveUsuario?: number;
  nombre?: string;
  correo?: string;
password?: string;
  tipo?: string; // Enum como string
  fecha_registro?: string; // ISO date string
  fotoperfil : string;
  telefono : number;
  direccion_completa : string;
  calle : string;
  colonia : string;
  ciudad : string;
  estado : string;
  codigo_postal : string;
  pais : string;
  latitud : number;
  longitud : number;
  place_id : string;
  google_address_components : string;

}
