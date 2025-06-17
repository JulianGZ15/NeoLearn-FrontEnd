import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultadoEvaluacionDTO } from '../../dtos/resultadoEvaluacion.dto';

@Injectable({
  providedIn: 'root'
})
export class ResultadoEvaluacionService {

  private apiUrl = 'http://localhost:8080/api/evaluaciones/resultados';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarResultadosPorEvaluacion(cveEvaluacion: number): Observable<ResultadoEvaluacionDTO[]> {
    const url = `${this.apiUrl}/evaluacion/${cveEvaluacion}`;
    return this.http.get<ResultadoEvaluacionDTO[]>(url, { headers: this.getHeaders() });
  }

  crearResultadoEvaluacion(dto: ResultadoEvaluacionDTO): Observable<ResultadoEvaluacionDTO> {
    return this.http.post<ResultadoEvaluacionDTO>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  actualizarResultadoEvaluacion(dto: ResultadoEvaluacionDTO): Observable<ResultadoEvaluacionDTO> {
    return this.http.put<ResultadoEvaluacionDTO>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  eliminarResultadoEvaluacion(cveResultadoevaluacion: number): Observable<void> {
    const url = `${this.apiUrl}/${cveResultadoevaluacion}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

}
