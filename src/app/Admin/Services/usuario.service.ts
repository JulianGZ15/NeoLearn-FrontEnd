import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../../../dtos/usuario.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/api/usuarios`;

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
  
    obtenerUsuario(): Observable<UsuarioDTO> {
    const headers = this.getHeaders();
    return this.http.get<UsuarioDTO>(`${this.apiUrl}`, { headers });
  }
  
    actualizarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO>{
      const headers = this.getHeaders();
      return this.http.put<UsuarioDTO>(`${this.apiUrl}`, usuario, {headers})

    }
}
