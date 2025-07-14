import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreguntaEvaluacionDTO } from '../../../dtos/preguntaEvaluacion.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class PreguntaEvaluacionService {

    private apiUrl = `${environment.apiUrl}/api/evaluacion/preguntas`;


  constructor(private http: HttpClient) { }

     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  obtenerPreguntaPorId(cvePreguntaEvaluacion: number): Observable<PreguntaEvaluacionDTO> {
    return this.http.get<PreguntaEvaluacionDTO>(
      `${this.apiUrl}/${cvePreguntaEvaluacion}`,
      { headers: this.getHeaders() }
    );
  }

  listarPreguntasPorEvaluacion(cveEvaluacion: number): Observable<PreguntaEvaluacionDTO[]> {
    return this.http.get<PreguntaEvaluacionDTO[]>(
      `${this.apiUrl}/evaluacion/${cveEvaluacion}`,
      { headers: this.getHeaders() }
    );
  }

  crearPregunta(cveEvaluacion: number, dto: PreguntaEvaluacionDTO): Observable<PreguntaEvaluacionDTO> {
    return this.http.post<PreguntaEvaluacionDTO>(
      `${this.apiUrl}/${cveEvaluacion}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  actualizarPregunta(cvePreguntaEvaluacion: number, dto: PreguntaEvaluacionDTO): Observable<PreguntaEvaluacionDTO> {
    return this.http.put<PreguntaEvaluacionDTO>(
      `${this.apiUrl}/${cvePreguntaEvaluacion}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  eliminarPregunta(cvePreguntaEvaluacion: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${cvePreguntaEvaluacion}`,
      { headers: this.getHeaders() }
    );
  }
}
