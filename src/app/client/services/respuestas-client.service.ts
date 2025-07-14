import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaDTO } from '../../../dtos/respuesta.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class RespuestasClientService {



    private apiUrl = `${environment.apiUrl}/api/respuestas`;


  constructor(private http: HttpClient) { }

     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }



  obtenerRespuestaPorId(cveRespuesta: number): Observable<RespuestaDTO> {
    return this.http.get<RespuestaDTO>(`${this.apiUrl}/${cveRespuesta}`, {
      headers: this.getHeaders()
    });
  }

  crearRespuesta(cvePregunta: number, dto: RespuestaDTO): Observable<RespuestaDTO> {
    return this.http.post<RespuestaDTO>(`${this.apiUrl}/${cvePregunta}`, dto, {
      headers: this.getHeaders()
    });
  }

  actualizarRespuesta(cvePregunta: number, dto: RespuestaDTO): Observable<RespuestaDTO> {
    return this.http.put<RespuestaDTO>(`${this.apiUrl}/${cvePregunta}`, dto, {
      headers: this.getHeaders()
    });
  }

  eliminarRespuesta(cveRespuesta: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cveRespuesta}`, {
      headers: this.getHeaders()
    });
  }

  listarRespuestasPorPregunta(cvePregunta: number): Observable<RespuestaDTO[]> {
    return this.http.get<RespuestaDTO[]>(`${this.apiUrl}/pregunta/${cvePregunta}`, {
      headers: this.getHeaders()
    });
  }

}
