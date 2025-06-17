import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClaseEnVivoDTO } from '../../dtos/claseEnVivo.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaseEnVivoService {

 private apiUrl = 'http://localhost:8080/api/clases-en-vivo';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarClasesPorCurso(cursoId: number): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(`${this.apiUrl}/curso/${cursoId}`, {
      headers: this.getHeaders()
    });
  }

  crearClase(clase: ClaseEnVivoDTO): Observable<ClaseEnVivoDTO> {
    return this.http.post<ClaseEnVivoDTO>(this.apiUrl, clase, {
      headers: this.getHeaders()
    });
  }

  iniciarClase(claseId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${claseId}/iniciar`, {
      headers: this.getHeaders()
    });
  }

  finalizarClase(claseId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${claseId}/finalizar`, {}, {
      headers: this.getHeaders()
    });
  }
}
