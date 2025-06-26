// interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private messageService: MessageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Sesión Expirada',
            detail: 'Por favor, inicia sesión nuevamente'
          });
        } else if (error.status >= 500) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error del Servidor',
            detail: 'Ha ocurrido un error interno. Intenta más tarde.'
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}
