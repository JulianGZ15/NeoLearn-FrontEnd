import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { Observable } from 'rxjs';
import { EvaluacionDTO } from '../../../dtos/evaluacion.dto';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionesClientService {

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
}
