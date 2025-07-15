import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { RespuestaEvaluacionDTO } from '../../../dtos/respuestaEvaluacion.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespuestasEvaluacionClientService {





  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  private apiUrl = `${environment.apiUrl}/api/respuestas-evaluacion`;

  crearRespuestaEvaluacion(dto: RespuestaEvaluacionDTO): Observable<RespuestaEvaluacionDTO> {
    return this.http.post<RespuestaEvaluacionDTO>(`${this.apiUrl}`, dto, {
      headers: this.getHeaders()
    })
  }

  crearRespuestasEvaluacion(dto: RespuestaEvaluacionDTO[]): Observable<RespuestaEvaluacionDTO[]>{
    return this.http.post<RespuestaEvaluacionDTO[]>(`${this.apiUrl}/bulk`, dto, {
      headers: this.getHeaders()
    })  
  }

    obbtenerRespuestasPorResultado(cveResultadoEvaluacion: number):Observable<RespuestaEvaluacionDTO[]>{
    return this.http.get<RespuestaEvaluacionDTO[]>(`${this.apiUrl}/resultado/${cveResultadoEvaluacion}`, {
      headers: this.getHeaders()
    })  
  }
}
