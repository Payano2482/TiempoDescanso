import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmpleadosService } from '../services/empleados.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class HomePage implements OnInit, OnDestroy {
  empleadosEnDescanso: number = 0;
  horaActual: Date = new Date();
  private subscription!: Subscription;
  private clockSubscription!: Subscription;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private empleadosService: EmpleadosService
  ) {}

  ngOnInit() {
    // Actualizar el reloj cada segundo
    this.clockSubscription = interval(1000).subscribe(() => {
      this.horaActual = new Date();
    });

    // Suscribirse a cambios en empleados
    this.subscription = this.empleadosService.empleados$.subscribe(empleados => {
      this.empleadosEnDescanso = empleados.filter(emp => emp.activo).length;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  navegarADescanso() {
    this.router.navigate(['/descanso']);
  }

  navegarAHistorial() {
    this.router.navigate(['/historial']);
  }

  async confirmarBorrarTodo() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea borrar todos los registros?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, borrar todo',
          handler: () => {
            this.empleadosService.limpiarTodo();
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmarSalir() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, salir',
          handler: () => {
            this.empleadosService.limpiarTodo();
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await alert.present();
  }
}