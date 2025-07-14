import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../Admin/layout/component/app.floatingconfigurator';
import { LoginService } from '../../Admin/Services/login.service';
import { LoginRequest } from '../../Admin/Services/loginRequest';
import { User } from '../../../models/user';

@Component({
  selector: 'app-auth',
  imports: [ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    AppFloatingConfigurator],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {


  correo: string = '';
  password: string = '';

  constructor(private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService) {


  }





  login() {
    if (this.correo && this.password) {
      const loginRequest: LoginRequest = {
        correo: this.correo,
        password: this.password
      };

      this.loginService.login(loginRequest).subscribe({
        next: (userData) => {
          console.log(userData);
          console.log(User)
        },

        error: (errorData) => {
          console.error(errorData);
        },

        complete: () => {




          console.info("Login completo")
          this.router.navigateByUrl('/start/dashboard');

        }

      })

    }
    else {
      console.log("Error al ingresar datos");
    }

  }

  registro() {
    this.router.navigateByUrl('/registro');

  }

}
