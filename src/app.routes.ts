import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/dashboard/dashboard';
import { AuthComponent } from './app/auth/auth/auth.component';
import { CursosComponent } from './app/components/cursos/cursos.component';
import { VideosComponent } from './app/components/videos/videos.component';
import { EvaluacionesComponent } from './app/components/evaluaciones/evaluaciones.component';
import { InscripcionesComponent } from './app/components/inscripciones/inscripciones.component';
import { InvitacionesComponent } from './app/components/invitaciones/invitaciones.component';
import { PreguntasEvaluacionComponent } from './app/components/preguntas-evaluacion/preguntas-evaluacion.component';
import { PreguntasCursoComponent } from './app/components/preguntas-curso/preguntas-curso.component';
import { ClaseEnVivoComponent } from './app/components/clase-en-vivo/clase-en-vivo.component';
import { CuponesComponent } from './app/components/cupones/cupones.component';
import { VideoLlamadaComponent } from './app/components/video-llamada/video-llamada.component';
import { appLanding } from './app/landing/landingMain';
import { ConfiguracionCertificadosComponent } from './app/components/configuracion-certificados/configuracion-certificados.component';
import { CalendarioClasesComponent } from './app/components/calendario-clases/calendario-clases.component';
import { RegisterComponent } from './app/auth/register/register.component';
import { PerfilComponent } from './app/components/perfil/perfil.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: appLanding,
    },
    {
        path: 'auth',
        component: AuthComponent,
    },
    {
        path: 'register',
        component: RegisterComponent
    },

    {
        path: 'start',
        component: AppLayout,
        children: [
            { path: 'perfil', component: PerfilComponent},
            { path: 'dashboard', component: Dashboard },
            { path: 'cursos', component: CursosComponent },
            { path: 'invitaciones', component: InvitacionesComponent },
            { path: 'configuracion-certificados', component: ConfiguracionCertificadosComponent },
            { path: 'videos/:idCurso', component: VideosComponent },
            { path: 'calendario-clases', component: CalendarioClasesComponent},


        ]
    },

{
        path: 'cursos',
        component: AppLayout,
        children: [
            { path: 'videos/:idCurso', component: VideosComponent },
            { path: 'suscripciones/:idCurso', component: InscripcionesComponent },
            { path: 'preguntas/:idCurso', component: PreguntasCursoComponent },
            { path: 'evaluaciones/:idCurso', component: EvaluacionesComponent },
            { path: 'cupones/:idCurso', component: CuponesComponent },
            { path: 'evaluaciones/preguntas/:idEvaluacion', component: PreguntasEvaluacionComponent },
            { path: 'clase-en-vivo/:idCurso', component: ClaseEnVivoComponent},
            { path: 'clase-vivo/:idClase', component: VideoLlamadaComponent},
            
            

        ]
    },

];
