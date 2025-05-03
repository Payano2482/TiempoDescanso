import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConfiguracionComponent implements OnInit {
  constructor(private router: Router, private alertController: AlertController) {}

  ngOnInit() {
    const sesion = localStorage.getItem('sesion');
    if (!sesion || JSON.parse(sesion).usuario !== 'descanso01') {
      this.router.navigate(['/home']);
      this.mostrarAlerta();
    }
  }

  async mostrarAlerta() {
    const alert = await this.alertController.create({
      header: 'Acceso denegado',
      message: 'Solo el administrador puede acceder a esta sección.',
      buttons: ['OK']
    });
    await alert.present();
  }
} 