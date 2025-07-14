// services/base.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  protected apiUrl = environment.apiUrl;

  protected getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Error en servicio:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
      this.clearAuthToken();
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => ({ status: error.status, message: errorMessage }));
  };

  private clearAuthToken(): void {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    // Aquí puedes redirigir al login si tienes router
  }
}
