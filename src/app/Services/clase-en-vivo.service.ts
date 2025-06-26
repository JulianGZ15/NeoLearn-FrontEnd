// services/clase-en-vivo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { 
  ClaseEnVivoDTO, 
  ProgramarClaseRequest, 
  ClaseEnVivoResumen,
  ReprogramarClaseRequest 
} from '../../dtos/claseEnVivo.dto';
import { SalaEnVivoDTO } from '../../dtos/salaEnVivo.dto';
import { EstadoClase } from '../../dtos/estadoClase.enum';

@Injectable({
  providedIn: 'root'
})
export class ClaseEnVivoService extends BaseService {
  private readonly endpoint = '/api/clases-en-vivo';

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Programar una nueva clase
   */
  programarClase(request: ProgramarClaseRequest, idSala: number): Observable<ClaseEnVivoDTO> {
    return this.http.post<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/programar?idSala=${idSala}`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reprogramar una clase existente
   */
  reprogramarClase(idClase: number, nuevaFecha: string): Observable<ClaseEnVivoDTO> {
    const params = new HttpParams().set('nuevaFecha', nuevaFecha);
    
    return this.http.put<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idClase}/reprogramar`,
      {},
      { headers: this.getHeaders(), params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancelar una clase
   */
  cancelarClase(idClase: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${this.endpoint}/${idClase}/cancelar`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Iniciar transmisión de una clase
   */
  iniciarTransmision(idClase: number): Observable<ClaseEnVivoDTO> {
    return this.http.put<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idClase}/iniciar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Finalizar transmisión de una clase
   */
  finalizarTransmision(idClase: number): Observable<ClaseEnVivoDTO> {
    return this.http.put<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idClase}/finalizar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar clases por curso
   */
  listarPorCurso(idCurso: number): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/curso/${idCurso}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(clases => clases.sort((a, b) => 
        new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
      )),
      catchError(this.handleError)
    );
  }

  /**
   * Listar clases por curso y fecha específica
   */
  listarPorCursoYFecha(idCurso: number, fecha: string): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/curso/${idCurso}/fecha/${fecha}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener mis clases como instructor
   */
  obtenerMisClases(): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/instructor/mis-clases`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar clases actualmente en vivo
   */
  listarClasesEnVivo(): Observable<ClaseEnVivoDTO[]> {
    return this.http.get<ClaseEnVivoDTO[]>(
      `${this.apiUrl}${this.endpoint}/en-vivo`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener detalle de una clase
   */
  obtenerDetalle(idClase: number): Observable<ClaseEnVivoDTO> {
    return this.http.get<ClaseEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/${idClase}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Activar sala para una clase
   */
  activarSala(idSala: number): Observable<SalaEnVivoDTO> {
    return this.http.put<SalaEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/sala/${idSala}/activar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Finalizar sala
   */
  finalizarSala(idSala: number): Observable<SalaEnVivoDTO> {
    return this.http.put<SalaEnVivoDTO>(
      `${this.apiUrl}${this.endpoint}/sala/${idSala}/finalizar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos de utilidad
  /**
   * Filtrar clases por estado
   */
  filtrarPorEstado(clases: ClaseEnVivoDTO[], estado: EstadoClase): ClaseEnVivoDTO[] {
    return clases.filter(clase => clase.estado === estado);
  }

  /**
   * Obtener clases de hoy
   */
  obtenerClasesDeHoy(idCurso: number): Observable<ClaseEnVivoDTO[]> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.listarPorCursoYFecha(idCurso, hoy);
  }

  /**
   * Verificar si una clase puede iniciarse
   */
  puedeIniciarClase(clase: ClaseEnVivoDTO): boolean {
    if (!clase.fechaProgramada) return false;
    
    const ahora = new Date();
    const fechaProgramada = new Date(clase.fechaProgramada);
    const diferenciaMins = (ahora.getTime() - fechaProgramada.getTime()) / (1000 * 60);
    
    // Puede iniciar 15 minutos antes o después de la hora programada
    return diferenciaMins >= -15 && diferenciaMins <= 60 && clase.estado === EstadoClase.PROGRAMADA;
  }

  /**
   * Obtener duración de una clase en formato legible
   */
  obtenerDuracionFormateada(clase: ClaseEnVivoDTO): string {
    if (!clase.duracionEstimadaMinutos) return 'No especificada';
    
    const horas = Math.floor(clase.duracionEstimadaMinutos / 60);
    const minutos = clase.duracionEstimadaMinutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos > 0 ? minutos + 'm' : ''}`.trim();
    }
    return `${minutos}m`;
  }
}
