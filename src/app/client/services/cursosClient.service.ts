import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CursoDTO } from '../../../dtos/cuso.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursosClientService {
  private apiUrl = `${environment.apiUrl}/api/cursos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarCursosInscritos(): Observable<CursoDTO[]> {
    return this.http.get<CursoDTO[]>(this.apiUrl + '/inscritos', { headers: this.getHeaders() });
  }

  listarCursosDisponiblesParaCompra(): Observable<CursoDTO[]> {
    return this.http.get<CursoDTO[]>(this.apiUrl + '/disponibles', { headers: this.getHeaders() });
  }

  obtenerCursoPorId(id: number): Observable<CursoDTO> {
    return this.http.get<CursoDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }



  obtenerPortada(nombreArchivo: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
    });

    return this.http.get(
      `http://localhost:8080/api/cursos/portada/${encodeURIComponent(nombreArchivo)}`,
      { headers, responseType: 'blob' }
    );
  }


}