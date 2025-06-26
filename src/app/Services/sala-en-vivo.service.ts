// services/sala-en-vivo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { SalaEnVivoDTO } from '../../dtos/salaEnVivo.dto';

@Injectable({
  providedIn: 'root'
})
export class SalaEnVivoService extends BaseService {
  private readonly endpoint = '/api/salas-en-vivo';

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Crear una nueva sala para un curso
   */
  crearSala(idCurso: number): Observable<SalaEnVivoDTO> {
    return this.http.post<SalaEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/crear?idCurso=${idCurso}`, 
      {}, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener sala por ID
   */
  obtenerPorId(idSala: number): Observable<SalaEnVivoDTO> {
    return this.http.get<SalaEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idSala}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener salas por curso
   */
  obtenerPorCurso(idCurso: number): Observable<SalaEnVivoDTO[]> {
    return this.http.get<SalaEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/curso/${idCurso}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(salas => salas.sort((a, b) => 
        new Date(b.fechaCreacion || '').getTime() - new Date(a.fechaCreacion || '').getTime()
      )),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener salas activas por curso
   */
  obtenerSalasActivas(idCurso: number): Observable<SalaEnVivoDTO[]> {
    return this.obtenerPorCurso(idCurso).pipe(
      map(salas => salas.filter(sala => sala.activa))
    );
  }

  /**
   * Eliminar sala
   */
  eliminarSala(idSala: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${this.endpoint}/${idSala}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener estado de una sala por código
   */
  obtenerPorCodigo(codigoSala: string): Observable<SalaEnVivoDTO> {
    return this.http.get<SalaEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/codigo/${codigoSala}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Unirse a una sala
   */
  unirseASala(idSala: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api/clases-en-vivo/sala/${idSala}/unirse`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Salir de una sala
   */
  salirDeSala(idSala: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/clases-en-vivo/sala/${idSala}/salir`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
