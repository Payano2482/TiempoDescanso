import { Pipe, PipeTransform } from '@angular/core';
import { EmpleadoDescanso } from '../services/empleados.service';

@Pipe({
  name: 'tiempoFormato',
  standalone: true
})
export class TiempoFormatoPipe implements PipeTransform {

  transform(value: EmpleadoDescanso | number): string {
    if (typeof value === 'number') {
      const minutos = Math.floor(value);
      const segundos = Math.floor((value % 1) * 60);
      return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    const minutos = value.tiempoTranscurrido;
    const segundos = value.segundos;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

}
