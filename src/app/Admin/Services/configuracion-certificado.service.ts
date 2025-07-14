import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfiguracionDTO } from '../../../dtos/configuracion.dto';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  
  private apiUrl = 'http://localhost:8080/api/configuracion-certificados';
    private archivosUrl = 'http://localhost:8080/api/archivos';


  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private getHeadersWithContentType(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene la configuración de certificados por empresa
   */
obtenerConfiguracion(cveEmpresa: number): Observable<ConfiguracionDTO> {
  return this.http.get<ConfiguracionDTO>(
    `${this.apiUrl}/${cveEmpresa}`,
    { headers: this.getHeaders() }
  ).pipe(
    catchError((error) => {
      if (error.status === 404) {
        // Si no existe configuración, devolver una vacía
        return of({} as ConfiguracionDTO);
      }
      return this.handleError(error);
    })
  );
}

  /**
   * Guarda la configuración general
   */
  guardarConfiguracion(configuracion: ConfiguracionDTO): Observable<ConfiguracionDTO> {
    return this.http.post<ConfiguracionDTO>(
      this.apiUrl,
      configuracion,
      { headers: this.getHeadersWithContentType() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube la imagen de firma
   */
  subirFirma(file: File): Observable<ConfiguracionDTO> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ConfiguracionDTO>(
      `${this.apiUrl}/guardar-firma`,
      formData,
      { headers: this.getHeaders() } // No incluir Content-Type para FormData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube el logo
   */
  subirLogo(file: File): Observable<ConfiguracionDTO> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ConfiguracionDTO>(
      `${this.apiUrl}/guardar-logo`,
      formData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Guarda el nombre del firmante
   */
  guardarFirmante(firmante: string): Observable<ConfiguracionDTO> {
    return this.http.post<ConfiguracionDTO>(
      `${this.apiUrl}/guardar-firmante`,
      { firmante },
      { headers: this.getHeadersWithContentType() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Valida el archivo antes de subirlo
   */
  validarArchivo(file: File): { valido: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (!file) {
      return { valido: false, error: 'No se ha seleccionado ningún archivo' };
    }

    if (file.size > maxSize) {
      return { valido: false, error: 'El archivo no puede ser mayor a 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valido: false, error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF)' };
    }

    return { valido: true };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.error || `Error ${error.status}: ${error.message}`;
    }
    
    console.error('Error en ConfiguracionService:', error);
    return throwError(() => new Error(errorMessage));
  }



  obtenerUrlLogo(nombreLogo?: string): string {
    const logo = nombreLogo || this.getLogoActual();
    if (!logo) return '';
    
    const token = sessionStorage.getItem('token');
    const timestamp = new Date().getTime();
    return `${this.archivosUrl}/logo/${logo}?token=${encodeURIComponent(token || '')}&t=${timestamp}`;
  }

  /**
   * ✅ NUEVO: Obtiene la URL de la firma con token JWT
   */
  obtenerUrlFirma(nombreFirma?: string): string {
    const firma = nombreFirma || this.getFirmaActual();
    if (!firma) return '';
    
    const token = sessionStorage.getItem('token');
    const timestamp = new Date().getTime();
    return `${this.archivosUrl}/firma/${firma}?token=${encodeURIComponent(token || '')}&t=${timestamp}`;
  }

  /**
   * ✅ NUEVO: Obtiene el logo como blob para mostrar en img src
   */
  obtenerLogoBlob(nombreLogo: string): Observable<string> {
    return this.http.get(
      `${this.archivosUrl}/logo/${nombreLogo}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(this.handleError)
    );
  }

  /**
   * ✅ NUEVO: Obtiene la firma como blob para mostrar en img src
   */
  obtenerFirmaBlob(nombreFirma: string): Observable<string> {
    return this.http.get(
      `${this.archivosUrl}/firma/${nombreFirma}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(this.handleError)
    );
  }

  /**
   * ✅ NUEVO: Verifica si una imagen existe en el servidor
   */
  verificarExistenciaImagen(tipo: 'logo' | 'firma', nombreArchivo: string): Observable<boolean> {
    const url = tipo === 'logo' 
      ? `${this.archivosUrl}/logo/${nombreArchivo}`
      : `${this.archivosUrl}/firma/${nombreArchivo}`;

    return this.http.head(url, { headers: this.getHeaders() }).pipe(
      map(() => true),
      catchError(() => {
        return throwError(() => false);
      })
    );
  }

  /**
   * ✅ NUEVO: Descarga una imagen
   */
  descargarImagen(tipo: 'logo' | 'firma', nombreArchivo: string): Observable<Blob> {
    const url = tipo === 'logo' 
      ? `${this.archivosUrl}/logo/${nombreArchivo}`
      : `${this.archivosUrl}/firma/${nombreArchivo}`;

    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos auxiliares privados
  private getLogoActual(): string | null {
    // Aquí puedes implementar lógica para obtener el logo actual
    // Por ejemplo, desde una variable de clase o localStorage
    return null;
  }

  private getFirmaActual(): string | null {
    // Aquí puedes implementar lógica para obtener la firma actual
    // Por ejemplo, desde una variable de clase o localStorage
    return null;
  }

  

}

