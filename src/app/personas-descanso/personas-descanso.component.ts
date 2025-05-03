import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadosService, EmpleadoDescanso } from '../services/empleados.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personas-descanso',
  templateUrl: './personas-descanso.component.html',
  styleUrls: ['./personas-descanso.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PersonasDescansoComponent implements OnInit, OnDestroy {
  empleados: EmpleadoDescanso[] = [];
  filtro = '';
  private subscription!: Subscription;

  // Para el modal de agregar persona
  personaNueva = { nombre: '', equipo: '', fichaEquipo: '' };
  showModal = false;
  editando = false;
  personaEditandoNombre = '';

  constructor(
    private empleadosService: EmpleadosService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.empleados = this.empleadosService.obtenerEmpleadosActivos();
    this.subscription = this.empleadosService.empleados$.subscribe(empleados => {
      this.empleados = empleados.filter(emp => emp.activo);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get empleadosFiltrados() {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.empleados;
    return this.empleados.filter(emp =>
      emp.nombre.toLowerCase().includes(f) ||
      emp.equipo.toLowerCase().includes(f)
    );
  }

  abrirModalAgregar(empleado?: EmpleadoDescanso) {
    if (empleado) {
      this.editando = true;
      this.personaEditandoNombre = empleado.nombre;
      this.personaNueva = { nombre: empleado.nombre, equipo: empleado.equipo, fichaEquipo: empleado.fichaEquipo };
    } else {
      this.editando = false;
      this.personaEditandoNombre = '';
      this.personaNueva = { nombre: '', equipo: '', fichaEquipo: '' };
    }
    this.showModal = true;
  }

  cerrarModalAgregar() {
    this.showModal = false;
  }

  async guardarPersonaNueva() {
    const { nombre, equipo, fichaEquipo } = this.personaNueva;
    if (!nombre || !equipo || !fichaEquipo) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Completa todos los campos',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    if (!this.editando && this.empleados.some(emp => emp.nombre.toLowerCase() === nombre.toLowerCase())) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ya existe una persona en descanso con ese nombre',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    if (this.editando) {
      // Editar persona existente
      const index = this.empleados.findIndex(emp => emp.nombre === this.personaEditandoNombre);
      if (index !== -1) {
        this.empleados[index].equipo = equipo;
        this.empleados[index].fichaEquipo = fichaEquipo;
        // Actualizar en el servicio
        this.empleadosService.finalizarDescanso(nombre);
        this.empleadosService.agregarEmpleado({ nombre, equipo, fichaEquipo });
      }
    } else {
      this.empleadosService.agregarEmpleado({ nombre, equipo, fichaEquipo });
    }
    this.cerrarModalAgregar();
  }

  async finalizarDescanso(nombre: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Finalizar el descanso de ${nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Finalizar', handler: () => this.empleadosService.finalizarDescanso(nombre) }
      ]
    });
    await alert.present();
  }
} 