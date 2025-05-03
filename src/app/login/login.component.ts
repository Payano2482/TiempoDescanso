import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  usuario = '';
  contrasena = '';
  cargando = false;

  constructor(private alertController: AlertController, private router: Router) {}

  ngOnInit() {
    const sesion = localStorage.getItem('sesion');
    if (sesion) {
      this.router.navigate(['/home']);
    }
  }

  async login() {
    this.cargando = true;
    if (this.usuario === 'descanso01' && this.contrasena === 'TD2482') {
      localStorage.setItem('sesion', JSON.stringify({ usuario: this.usuario, esAdmin: true }));
      this.router.navigate(['/home']);
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Usuario o contraseña incorrectos',
        buttons: ['OK']
      });
      await alert.present();
    }
    this.cargando = false;
  }
} 