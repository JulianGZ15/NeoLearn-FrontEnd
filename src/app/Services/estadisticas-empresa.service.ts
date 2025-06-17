import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../../dtos/usuario.dto';
import { CursoVendidoDTO } from '../../dtos/cursoVendido.dto';
import { SuscripcionMensualDTO } from '../../dtos/suscripcionMensual.dto';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasEmpresaService {

    constructor(private http: HttpClient) { }

     private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token'); // Obtén el token del sessionStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
    private apiUrl = 'http://localhost:8080/api/estadisticas';


    obtenerResumen(): Observable<{ [key: string]: any }> {
      return this.http.get<{ [key: string]: any }>(
        `${this.apiUrl}/resumen`,
        { headers: this.getHeaders() }
      );
    }

    contarCursosPorEmpresa(): Observable<number> {
      return this.http.get<number>(
        `${this.apiUrl}/cursos/total`,
        { headers: this.getHeaders() }
      );
    }

    calcularGananciasMesActual(): Observable<number> {
      return this.http.get<number>(
        `${this.apiUrl}/ganancias/mes-actual`,
        { headers: this.getHeaders() }
      );
    }

    contarTotalSuscripciones(): Observable<number> {
      return this.http.get<number>(
        `${this.apiUrl}/suscripciones/total`,
        { headers: this.getHeaders() }
      );
    }

    contarEstudiantesEmpresa(): Observable<number> {
      return this.http.get<number>(
        `${this.apiUrl}/estudiantes/total`,
        { headers: this.getHeaders() }
      );
    }

    encontrarUltimosCincoSuscriptores(): Observable<UsuarioDTO[]> {
      return this.http.get<UsuarioDTO[]>(
        `${this.apiUrl}/suscriptores/ultimos-cinco`,
        { headers: this.getHeaders() }
      );
    }

    encontrarCursosMasVendidos(): Observable<CursoVendidoDTO[]> {
      return this.http.get<CursoVendidoDTO[]>(
        `${this.apiUrl}/cursos/mas-vendidos`,
        { headers: this.getHeaders() }
      );
    }

    obtenerSuscripcionesPorMes(): Observable<SuscripcionMensualDTO[]> {
      return this.http.get<SuscripcionMensualDTO[]>(
        `${this.apiUrl}/suscripciones/por-mes`,
        { headers: this.getHeaders() }
      );
    }
  }

