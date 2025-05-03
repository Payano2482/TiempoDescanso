import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DescansoComponent } from './descanso/descanso.component';
import { HistorialComponent } from './historial/historial.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { PersonasDescansoComponent } from './personas-descanso/personas-descanso.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'descanso',
    component: PersonasDescansoComponent
  },
  {
    path: 'historial',
    component: HistorialComponent
  },
  {
    path: 'configuracion',
    component: ConfiguracionComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
