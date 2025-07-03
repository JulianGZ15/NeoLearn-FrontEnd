export interface MensajeChatDTO {
  cveMensajeChat?: number;
  claseEnVivoId: number;
  codigoSala: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioAvatar?: string;
  contenido: string;
  timestamp: string;
  tipoMensaje: 'TEXTO' | 'SISTEMA' | 'ARCHIVO' | 'EMOJI';
  editado: boolean;
  fechaEdicion?: string;
  esMio: boolean;
}