import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CertificadoDTO } from '../../../dtos/cetificado.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  
  private apiUrl = `${environment.apiUrl}/api/certificados`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Busca un certificado por ID
   */
  buscarCertificadoPorId(cveCertificado: number): Observable<CertificadoDTO> {
    return this.http.get<CertificadoDTO>(
      `${this.apiUrl}/${cveCertificado}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lista todos los certificados
   */
  listarCertificados(): Observable<CertificadoDTO[]> {
    return this.http.get<CertificadoDTO[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Guarda o actualiza un certificado
   */
  guardarCertificado(certificado: CertificadoDTO): Observable<CertificadoDTO> {
    return this.http.post<CertificadoDTO>(
      this.apiUrl,
      certificado,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un certificado por ID
   */
  eliminarCertificado(cveCertificado: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${cveCertificado}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Genera un certificado para una inscripción
   */
  generarCertificado(cveInscripcion: number): Observable<CertificadoDTO> {
    return this.http.post<CertificadoDTO>(
      `${this.apiUrl}/${cveInscripcion}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene la URL para descargar un certificado
   */
  obtenerUrlDescarga(nombreArchivo: string): string {
    return `${this.apiUrl}/archivo/${nombreArchivo}`;
  }

  /**
   * Descarga un certificado
   */
  descargarCertificado(nombreArchivo: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });

    return this.http.get(
      `${this.apiUrl}/archivo/${nombreArchivo}`,
      { 
        headers: headers,
        responseType: 'blob'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Abre el certificado en una nueva ventana
   */
  abrirCertificado(nombreArchivo: string): void {
    const url = this.obtenerUrlDescarga(nombreArchivo);
    window.open(url, '_blank');
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.error || `Error ${error.status}: ${error.message}`;
    }
    
    console.error('Error en CertificadoService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
