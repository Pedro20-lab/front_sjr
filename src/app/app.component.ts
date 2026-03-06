import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Room, RoomCardComponent } from './room-card.component';

interface RoomsResponse {
  message: string;
  ingreso: string;
  salida: string;
  habitacionesDisponibles: Room[];
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, RoomCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly searchForm = this.fb.group({
    checkin: ['', Validators.required],
    checkout: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';
  queryInfo: Pick<RoomsResponse, 'message' | 'ingreso' | 'salida'> | null = null;
  rooms: Room[] = [];

  searchAvailableRooms(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { checkin, checkout } = this.searchForm.getRawValue();
    const params = new HttpParams()
      .set('check_in', checkin ?? '')
      .set('check_out', checkout ?? '');

    this.http
      .get<RoomsResponse>('http://127.0.0.1:8000/api/rooms/available', { params })
      .subscribe({
        next: (response) => {
          this.queryInfo = {
            message: response.message,
            ingreso: response.ingreso,
            salida: response.salida
          };
          this.rooms = response.habitacionesDisponibles;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo obtener la disponibilidad de habitaciones.';
          this.queryInfo = null;
          this.rooms = [];
          this.isLoading = false;
        }
      });
  }
}
