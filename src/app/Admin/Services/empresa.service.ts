import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmpresaDTO } from '../../../dtos/empresa.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

    private apiUrl = `${environment.apiUrl}/api/empresas`;

    constructor(private http: HttpClient) {}

   private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  listarEmpresas() {
    return this.http.get<EmpresaDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerEmpresaPorId(id: number) {
    return this.http.get<EmpresaDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearEmpresa(dto: EmpresaDTO) {
    return this.http.post<EmpresaDTO>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  actualizarEmpresa(id: number, dto: EmpresaDTO) {
    return this.http.put<EmpresaDTO>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() });
  }

  eliminarEmpresa(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  obtenerEmpresasPorUsuario(idUsuario: number) {
    return this.http.get<EmpresaDTO[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }
}
