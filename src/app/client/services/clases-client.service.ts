import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../../Admin/Services/base.service';
import { ClaseEnVivoDTO } from '../../../dtos/claseEnVivo.dto';
@Injectable({
  providedIn: 'root'
})
export class ClasesClientService extends BaseService {
  private readonly endpoint = '/api/clases-en-vivo';

  constructor(private http: HttpClient) {
    super();
  }

   listarClasesEnVivo(): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/en-vivo`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener detalle de una clase
   */
  obtenerDetalle(idClase: number): Observable<ClaseEnVivoDTO> {
    return this.http.get<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idClase}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

    obtenerDuracionFormateada(clase: ClaseEnVivoDTO): string {
    if (!clase.duracionEstimadaMinutos) return 'No especificada';
    
    const horas = Math.floor(clase.duracionEstimadaMinutos / 60);
    const minutos = clase.duracionEstimadaMinutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos > 0 ? minutos + 'm' : ''}`.trim();
    }
    return `${minutos}m`;
  }

    listarPorCurso(idCurso: number): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/curso/${idCurso}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(clases => clases.sort((a, b) => 
        new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
      )),
      catchError(this.handleError)
    );
  }

}
