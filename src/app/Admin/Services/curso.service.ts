import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CursoDTO } from '../../../dtos/cuso.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
    private apiUrl = `${environment.apiUrl}/api/cursos`;

    constructor(private http: HttpClient) {}

   private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }



    listarCursos(): Observable<CursoDTO[]> {
      return this.http.get<CursoDTO[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    obtenerCursoPorId(id: number): Observable<CursoDTO> {
      return this.http.get<CursoDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    crearCurso(dto: CursoDTO): Observable<CursoDTO> {
      return this.http.post<CursoDTO>(this.apiUrl, dto, { headers: this.getHeaders() });
    }

    actualizarCurso(id: number, dto: CursoDTO): Observable<CursoDTO> {
      return this.http.put<CursoDTO>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
    }

    eliminarCurso(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    subirPortada(cursoId: number, file: File): Observable<CursoDTO> {
      const formData = new FormData();
      formData.append('file', file);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        // No 'Content-Type', let browser set it for multipart/form-data
      });

      return this.http.post<CursoDTO>(
        `${this.apiUrl}/${cursoId}/portada`,
        formData,
        { headers }
      );
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

