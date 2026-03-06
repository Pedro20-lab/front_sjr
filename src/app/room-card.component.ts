import { Component, Input } from '@angular/core';

export interface Room {
  id_habitacion: number;
  numero_habitacion: string;
  tipo_habitacion: string;
  precio_habitacion: string;
  capacidad_habitacion: number;
}

@Component({
  selector: 'app-room-card',
  standalone: true,
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css'
})
export class RoomCardComponent {
  @Input({ required: true }) room!: Room;
}
