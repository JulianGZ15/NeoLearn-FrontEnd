import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreguntaDTO } from '../../../dtos/pregunta.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class PreguntasClientService {


    private apiUrl = `${environment.apiUrl}/api/preguntas`;


  constructor(private http: HttpClient) { }


  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerPreguntaPorId(cvePregunta: number): Observable<PreguntaDTO> {
    return this.http.get<PreguntaDTO>(`${this.apiUrl}/${cvePregunta}`, {
      headers: this.getHeaders()
    });
  }

  listarPreguntasPorCurso(cveCurso: number): Observable<PreguntaDTO[]> {
    return this.http.get<PreguntaDTO[]>(`${this.apiUrl}/curso/${cveCurso}`, {
      headers: this.getHeaders()
    });
  }

  crearPregunta(cveCurso: number, dto: PreguntaDTO): Observable<PreguntaDTO> {
    return this.http.post<PreguntaDTO>(`${this.apiUrl}/${cveCurso}`, dto, {
      headers: this.getHeaders()
    });
  }

  actualizarPregunta(cveCurso: number, dto: PreguntaDTO): Observable<PreguntaDTO> {
    return this.http.put<PreguntaDTO>(`${this.apiUrl}/${cveCurso}`, dto, {
      headers: this.getHeaders()
    });
  }

  eliminarPregunta(cvePregunta: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cvePregunta}`, {
      headers: this.getHeaders()
    });
  }
}