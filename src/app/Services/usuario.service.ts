import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../../dtos/usuario.dto';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {



  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerUsuarioPorId(cveUsuario: number): Observable<UsuarioDTO> {
    const headers = this.getHeaders();
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${cveUsuario}`, { headers });
  }
}
