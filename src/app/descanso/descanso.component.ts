import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadosService, EmpleadoDescanso } from '../services/empleados.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-descanso',
  templateUrl: './descanso.component.html',
  styleUrls: ['./descanso.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DescansoComponent implements OnInit, OnDestroy {
  empleadoNuevo = {
    nombre: '',
    equipo: '',
    fichaEquipo: ''
  };
  tiposEquipo = ['Voquete 789', 'Equipos Auxiliares'];
  empleados: EmpleadoDescanso[] = [];
  private subscription!: Subscription;

  constructor(
    private alertController: AlertController,
    private empleadosService: EmpleadosService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar empleados iniciales
    this.empleados = this.empleadosService.obtenerEmpleadosActivos();
    
    // Suscribirse a cambios en empleados
    this.subscription = this.empleadosService.empleados$.subscribe(empleados => {
      this.empleados = empleados.filter(emp => emp.activo);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  volverAInicio() {
    this.router.navigate(['/home']);
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

  async iniciarDescanso() {
    if (!this.empleadoNuevo.nombre || !this.empleadoNuevo.equipo || !this.empleadoNuevo.fichaEquipo) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor complete todos los campos',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.empleadosService.agregarEmpleado(this.empleadoNuevo);
    this.empleadoNuevo = {
      nombre: '',
      equipo: '',
      fichaEquipo: ''
    };
  }

  async finalizarDescanso(nombre: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Está seguro que desea finalizar el descanso de ${nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, finalizar',
          handler: () => {
            this.empleadosService.finalizarDescanso(nombre);
          }
        }
      ]
    });
    await alert.present();
  }
}
