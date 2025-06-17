import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { User } from './userRequest';
import { LoginRequest } from './loginRequest';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url: string = 'http://localhost:8080/api/auth/login';
  
  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentUserData: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(private http: HttpClient) { 
    this.currentUserLoginOn= new BehaviorSubject<boolean>(sessionStorage.getItem("token")!=null);
    this.currentUserData = new BehaviorSubject<string>(sessionStorage.getItem("token") || "" );
  }

  login(credentials: LoginRequest):Observable<User>{
    return this.http.post<any>(this.url,credentials).pipe(
      tap(userData =>{
        sessionStorage.setItem("token", userData.token);
        this.currentUserData.next(userData);
        this.currentUserLoginOn.next(true);
      }),
      map((userData)=> userData.token),
      catchError(this.handleError)
    )
  }

  logout():void{
    sessionStorage.removeItem("token");
    this.currentUserLoginOn.next(false);
  }

  private handleError(error:HttpErrorResponse){
    if(error.status===0){
      console.error('se haproducido un error ', error.error)
    }
      else{
        console.error('Backend retorno el codigo de estado ', error.error)
      }

      return throwError(()=> new Error('Algo fallo. Por favor intente de nuevo. '))
  }

  get userData(): Observable<string>{
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean>{
    return this.currentUserLoginOn.asObservable();
  }

  get userToken():string{
    return this.currentUserData.value;
  }



}
