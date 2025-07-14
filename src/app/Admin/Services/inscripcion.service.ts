import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InscripcionDTO } from '../../../dtos/inscripcion.dto';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {

  private apiUrl = 'http://localhost:8080/api/inscripciones';

  constructor(private http: HttpClient) { }

  
     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  listarInscripcionesPorCurso(cveCurso: number): Observable<InscripcionDTO[]> {
    return this.http.get<InscripcionDTO[]>(
      `${this.apiUrl}/curso/${cveCurso}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerInscripcionPorId(cveInscripcion: number): Observable<InscripcionDTO> {
    return this.http.get<InscripcionDTO>(
      `${this.apiUrl}/${cveInscripcion}`,
      { headers: this.getHeaders() }
    );
  }

  crearInscripcion(dto: InscripcionDTO, cveCurso: number): Observable<InscripcionDTO> {
    return this.http.post<InscripcionDTO>(
      `${this.apiUrl}/${cveCurso}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  actualizarInscripcion(dto: InscripcionDTO, cveCurso: number): Observable<InscripcionDTO> {
    return this.http.put<InscripcionDTO>(
      `${this.apiUrl}/${cveCurso}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  eliminarInscripcion(cveInscripcion: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${cveInscripcion}`,
      { headers: this.getHeaders() }
    );
  }


  }
