import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {
    const sesion = localStorage.getItem('sesion');
    if (!sesion && window.location.pathname !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  esAdmin(): boolean {
    const sesion = localStorage.getItem('sesion');
    if (!sesion) return false;
    return JSON.parse(sesion).usuario === 'descanso01';
  }

  logout() {
    localStorage.removeItem('sesion');
    this.router.navigate(['/login']);
  }
}
