import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';
import { AuthComponent } from './auth/auth.component';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: AuthComponent }
] as Routes;
