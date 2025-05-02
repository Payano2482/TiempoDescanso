import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { DescansoComponent } from './descanso/descanso.component';
import { HistorialComponent } from './historial/historial.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'descanso',
    component: DescansoComponent,
  },
  {
    path: 'historial',
    component: HistorialComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  }
]; 