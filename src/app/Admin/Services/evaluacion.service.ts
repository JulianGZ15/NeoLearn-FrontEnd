import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluacionDTO } from '../../../dtos/evaluacion.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

  constructor(private http: HttpClient) { }

     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
    private apiUrl = `${environment.apiUrl}/api/evaluaciones`;



  listarEvaluacionesPorCurso(cveCurso: number): Observable<EvaluacionDTO[]> {
    return this.http.get<EvaluacionDTO[]>(`${this.apiUrl}/curso/${cveCurso}`, {
      headers: this.getHeaders()
    });
  }

  obtenerEvaluacionPorId(cveEvaluacion: number): Observable<EvaluacionDTO> {
    return this.http.get<EvaluacionDTO>(`${this.apiUrl}/${cveEvaluacion}`, {
      headers: this.getHeaders()
    });
  }

  crearEvaluacion(cveCurso: number, dto: EvaluacionDTO): Observable<EvaluacionDTO> {
    return this.http.post<EvaluacionDTO>(`${this.apiUrl}/${cveCurso}`, dto, {
      headers: this.getHeaders()
    });
  }

  actualizarEvaluacion(cveCurso: number, dto: EvaluacionDTO): Observable<EvaluacionDTO> {
    return this.http.put<EvaluacionDTO>(`${this.apiUrl}/${cveCurso}`, dto, {
      headers: this.getHeaders()
    });
  }

  eliminarEvaluacion(cveEvaluacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cveEvaluacion}`, {
      headers: this.getHeaders()
    });
  }
}
