import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioDTO } from '../../../dtos/usuario.dto';
import { EmpresaDTO } from '../../../dtos/empresa.dto';
import { userRegister } from '../../../dtos/register.dto';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

    private url = `${environment.apiUrl}/api/auth/register`;


  constructor(private http: HttpClient) { }



  createUser(user: userRegister, dto: EmpresaDTO): Observable<any>{
    const body = { user, empresa: dto };
    return this.http.post(this.url, body);
  }
}
