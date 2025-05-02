import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadosService, RegistroDescanso } from '../services/empleados.service';
import { Subscription } from 'rxjs';
import { TiempoFormatoPipe } from '../pipes/tiempo-formato.pipe';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TiempoFormatoPipe, RouterModule]
})
export class HistorialComponent implements OnInit, OnDestroy {
  registros: RegistroDescanso[] = [];
  private subscription!: Subscription;

  constructor(
    private empleadosService: EmpleadosService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar registros iniciales
    this.registros = this.empleadosService.obtenerRegistros().sort((a, b) => b.finDescanso - a.finDescanso);
    
    // Suscribirse a cambios en registros
    this.subscription = this.empleadosService.registros$.subscribe(registros => {
      this.registros = registros.sort((a, b) => b.finDescanso - a.finDescanso);
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

  formatearFecha(timestamp: number): string {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
} 