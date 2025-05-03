import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertController } from '@ionic/angular';

export interface EmpleadoDescanso {
  nombre: string;
  equipo: string;
  fichaEquipo: string;
  tiempoTranscurrido: number;
  segundos: number;
  tiempoExcedido: number;
  estado: 'normal' | 'excedido' | 'completado';
  inicioDescanso: number;
  finDescanso?: number;
  activo: boolean;
}

export interface RegistroDescanso {
  nombre: string;
  equipo: string;
  fichaEquipo: string;
  inicioDescanso: number;
  finDescanso: number;
  duracionTotal: number;
  tiempoExcedido: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  private empleadosSubject = new BehaviorSubject<EmpleadoDescanso[]>([]);
  private registrosSubject = new BehaviorSubject<RegistroDescanso[]>([]);
  empleados$ = this.empleadosSubject.asObservable();
  registros$ = this.registrosSubject.asObservable();
  private intervalId: any;
  private audioContext: AudioContext | null = null;
  private alertadosExcedido = new Set<string>();

  constructor(private alertController: AlertController) {
    this.cargarEmpleados();
    this.cargarRegistros();
    this.iniciarConteoGlobal();
  }

  private reproducirBeep() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    
    // Reproducir 3 beeps rápidos
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
    
    setTimeout(() => {
      oscillator.start(this.audioContext!.currentTime + 0.2);
      oscillator.stop(this.audioContext!.currentTime + 0.3);
    }, 200);
    
    setTimeout(() => {
      oscillator.start(this.audioContext!.currentTime + 0.4);
      oscillator.stop(this.audioContext!.currentTime + 0.5);
    }, 400);
  }

  private async mostrarAlertaExcedido(empleado: EmpleadoDescanso) {
    // Reproducir beep
    this.reproducirBeep();

    const alert = await this.alertController.create({
      header: '¡Atención!',
      subHeader: 'Tiempo de descanso excedido',
      message: `${empleado.nombre} ha excedido el tiempo de descanso.`,
      cssClass: 'alerta-excedido',
      buttons: [
        {
          text: 'Aceptar',
          cssClass: 'alert-button-ok'
        }
      ]
    });
    await alert.present();
  }

  private cargarEmpleados() {
    const empleadosGuardados = localStorage.getItem('empleados');
    if (empleadosGuardados) {
      const empleados = JSON.parse(empleadosGuardados);
      this.empleadosSubject.next(empleados);
    }
  }

  private cargarRegistros() {
    const registrosGuardados = localStorage.getItem('registros_descanso');
    if (registrosGuardados) {
      const registros = JSON.parse(registrosGuardados);
      this.registrosSubject.next(registros);
    }
  }

  private guardarEmpleados(empleados: EmpleadoDescanso[]) {
    const empleadosActivos = empleados.filter(emp => emp.activo);
    localStorage.setItem('empleados', JSON.stringify(empleadosActivos));
    this.empleadosSubject.next(empleadosActivos);
  }

  private guardarRegistros(registros: RegistroDescanso[]) {
    localStorage.setItem('registros_descanso', JSON.stringify(registros));
    this.registrosSubject.next(registros);
  }

  private iniciarConteoGlobal() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      const empleados = this.empleadosSubject.value;
      if (empleados.length === 0) return;

      const empleadosActualizados = empleados.map(empleado => {
        if (!empleado.activo) return empleado;

        const tiempoTranscurridoTotal = Math.floor((Date.now() - empleado.inicioDescanso) / 1000);
        const minutos = Math.floor(tiempoTranscurridoTotal / 60);
        const segundos = tiempoTranscurridoTotal % 60;
        
        if (minutos < 1) {
          this.alertadosExcedido.delete(empleado.nombre);
          return {
            ...empleado,
            tiempoTranscurrido: minutos,
            segundos: segundos,
            estado: 'normal' as const
          };
        } else if (minutos < 11) { // 10 minutos después de exceder (ahora 10 después de 1)
          if (empleado.estado !== 'excedido' && !this.alertadosExcedido.has(empleado.nombre)) {
            this.alertadosExcedido.add(empleado.nombre);
            this.mostrarAlertaExcedido(empleado);
          }
          return {
            ...empleado,
            tiempoTranscurrido: minutos,
            segundos: segundos,
            tiempoExcedido: minutos - 1,
            estado: 'excedido' as const
          };
        } else {
          this.alertadosExcedido.delete(empleado.nombre);
          // Crear registro y desactivar empleado
          const registro: RegistroDescanso = {
            nombre: empleado.nombre,
            equipo: empleado.equipo,
            fichaEquipo: empleado.fichaEquipo,
            inicioDescanso: empleado.inicioDescanso,
            finDescanso: Date.now(),
            duracionTotal: minutos,
            tiempoExcedido: minutos - 1
          };

          const registrosActuales = this.registrosSubject.value;
          this.guardarRegistros([...registrosActuales, registro]);

          return {
            ...empleado,
            tiempoTranscurrido: minutos,
            segundos: segundos,
            tiempoExcedido: minutos - 1,
            estado: 'completado' as const,
            finDescanso: Date.now(),
            activo: false
          };
        }
      });

      this.guardarEmpleados(empleadosActualizados);
    }, 1000);
  }

  agregarEmpleado(empleado: Omit<EmpleadoDescanso, 'tiempoTranscurrido' | 'segundos' | 'tiempoExcedido' | 'estado' | 'inicioDescanso' | 'activo'>) {
    const empleados = this.empleadosSubject.value;
    const nuevoEmpleado: EmpleadoDescanso = {
      ...empleado,
      tiempoTranscurrido: 0,
      segundos: 0,
      tiempoExcedido: 0,
      estado: 'normal',
      inicioDescanso: Date.now(),
      activo: true
    };
    this.guardarEmpleados([...empleados, nuevoEmpleado]);
  }

  finalizarDescanso(nombre: string) {
    const empleados = this.empleadosSubject.value;
    const empleado = empleados.find(emp => emp.nombre === nombre);
    
    if (empleado) {
      const tiempoTranscurridoTotal = Math.floor((Date.now() - empleado.inicioDescanso) / 60);
      const registro: RegistroDescanso = {
        nombre: empleado.nombre,
        equipo: empleado.equipo,
        fichaEquipo: empleado.fichaEquipo,
        inicioDescanso: empleado.inicioDescanso,
        finDescanso: Date.now(),
        duracionTotal: tiempoTranscurridoTotal,
        tiempoExcedido: Math.max(0, tiempoTranscurridoTotal - 1)
      };

      const registrosActuales = this.registrosSubject.value;
      this.guardarRegistros([...registrosActuales, registro]);
    }

    const empleadosActualizados = empleados.filter(emp => emp.nombre !== nombre);
    this.guardarEmpleados(empleadosActualizados);
  }

  limpiarTodo() {
    localStorage.removeItem('empleados');
    localStorage.removeItem('registros_descanso');
    this.empleadosSubject.next([]);
    this.registrosSubject.next([]);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  limpiarHistorial() {
    localStorage.removeItem('registros_descanso');
    this.registrosSubject.next([]);
  }

  obtenerEmpleadosActivos() {
    return this.empleadosSubject.value.filter(emp => emp.activo);
  }

  obtenerRegistros() {
    return this.registrosSubject.value;
  }
}
