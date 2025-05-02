import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoFormato',
})
export class TiempoFormatoPipe implements PipeTransform {
  transform(tiempo: number): string {
    const minutos = Math.floor(Math.abs(tiempo));
    const segundos = 0; // Como estamos trabajando en minutos, los segundos siempre serán 0
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
}