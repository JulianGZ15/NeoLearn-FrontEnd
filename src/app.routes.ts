import { Routes } from '@angular/router';
import { AppLayout } from './app/Admin/layout/component/app.layout';
import { Dashboard } from './app/Admin/dashboard/dashboard';
import { AuthComponent } from './app/auth/auth/auth.component';
import { CursosComponent } from './app/Admin/components/cursos/cursos.component';
import { VideosComponent } from './app/Admin/components/videos/videos.component';
import { EvaluacionesComponent } from './app/Admin/components/evaluaciones/evaluaciones.component';
import { InscripcionesComponent } from './app/Admin/components/inscripciones/inscripciones.component';
import { InvitacionesComponent } from './app/Admin/components/invitaciones/invitaciones.component';
import { PreguntasEvaluacionComponent } from './app/Admin/components/preguntas-evaluacion/preguntas-evaluacion.component';
import { PreguntasCursoComponent } from './app/Admin/components/preguntas-curso/preguntas-curso.component';
import { ClaseEnVivoComponent } from './app/Admin/components/clase-en-vivo/clase-en-vivo.component';
import { CuponesComponent } from './app/Admin/components/cupones/cupones.component';
import { VideoLlamadaComponent } from './app/Admin/components/video-llamada/video-llamada.component';
import { appLanding } from './app/landing/landingMain';
import { ConfiguracionCertificadosComponent } from './app/Admin/components/configuracion-certificados/configuracion-certificados.component';
import { CalendarioClasesComponent } from './app/Admin/components/calendario-clases/calendario-clases.component';
import { RegisterComponent } from './app/auth/register/register.component';
import { PerfilComponent } from './app/Admin/components/perfil/perfil.component';
import { MainLayoutComponent } from './app/client/layout/main-layout/main-layout.component';
import { DashboardClientComponent } from './app/client/pages/dashboard/dashboard.component';
import { DetalleCursoComponent } from './app/client/pages/detalle-curso/detalle-curso.component';
import { VideosClientComponent } from './app/client/pages/videos-client/videos-client.component';
import { EvaluacionesClientComponent } from './app/client/pages/evaluaciones-client/evaluaciones-client.component';
import { PreguntasClientComponent } from './app/client/pages/preguntas-client/preguntas-client.component';
import { ClaseEnVivoClientComponent } from './app/client/pages/clase-en-vivo-client/clase-en-vivo-client.component';

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


    {
    path: 'client',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardClientComponent },
      { path: 'curso-detalle/:id', component:DetalleCursoComponent},
      { path: 'curso/videos/:id', component:VideosClientComponent},
      { path: 'curso/evluaciones/:id', component:EvaluacionesClientComponent},
      { path: 'curso/preguntas/:id', component:PreguntasClientComponent},
      { path: 'curso/clases/:id', component:ClaseEnVivoClientComponent},
      { path: 'curso/clase-vivo/:idClase', component: VideoLlamadaComponent},

      // Otras rutas...
    ]
  }


];
