import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultadoEvaluacionDTO } from '../../../dtos/resultadoEvaluacion.dto';
import { environment } from '../../../../environment';
@Injectable({
  providedIn: 'root'
})
export class ResultadoEvaluacionClientService {

    private apiUrl = `${environment.apiUrl}/api/evaluaciones/resultados`;

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
}
