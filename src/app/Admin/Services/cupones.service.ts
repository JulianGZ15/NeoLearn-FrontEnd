import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CuponDTO } from '../../../dtos/cupon.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CuponService {
    private apiUrl = `${environment.apiUrl}/api/cupones`;
  
  constructor(private http: HttpClient) { }

   private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarCupones(cveCurso: number): Observable<CuponDTO[]> {
    return this.http.get<CuponDTO[]>(`${this.apiUrl}/${cveCurso}/cupones`, { headers: this.getHeaders() });
  }

  obtenerCuponPorId(id: number): Observable<CuponDTO> {
    return this.http.get<CuponDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearCupon(cveCurso: number,dto: CuponDTO): Observable<CuponDTO> {
    return this.http.post<CuponDTO>(`${this.apiUrl}/${cveCurso}`, dto, { headers: this.getHeaders() });
  }

  actualizarCupon(cveCurso: number, dto: CuponDTO): Observable<CuponDTO> {
    return this.http.put<CuponDTO>(`${this.apiUrl}/${cveCurso}`, dto, { headers: this.getHeaders() });
  }

  eliminarCupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
