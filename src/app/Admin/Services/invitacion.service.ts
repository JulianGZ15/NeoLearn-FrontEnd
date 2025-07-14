import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenInvitacionEmpresaDTO } from '../../../dtos/tokenInvitacionEmpresa.dto';

@Injectable({
  providedIn: 'root'
})
export class InvitacionService {

  
    private apiUrl = 'http://localhost:8080/api/invitaciones';

    constructor(private http: HttpClient) { }

     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


generarInvitacion(): Observable<string> {
  return this.http.post<string>(
    `${this.apiUrl}/generar`,
    {},
    { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' // Especifica que esperas texto
    }
  );
}



    registrar(dto: TokenInvitacionEmpresaDTO, token: string): Observable<HttpResponse<void>> {
      return this.http.post<void>(
        `${this.apiUrl}/registrar?token=${encodeURIComponent(token)}`,
        dto,
        { headers: this.getHeaders(), observe: 'response' }
      );
    }

    obtenerInvitacionesPorEmpresa(): Observable<TokenInvitacionEmpresaDTO[]> {
      return this.http.get<TokenInvitacionEmpresaDTO[]>(
        `${this.apiUrl}`,
        { headers: this.getHeaders() }
      );
    }
}

