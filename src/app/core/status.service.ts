import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  weather = signal({ temp: 39, condition: "Soleggiato", city: "Colombo" });
  exchangeRate = signal({ rate: 330.45, trend: 'stable' });
  safetyAlert = signal({ level: 'Safe', message: 'Nessun pericolo segnalato ' });

  constructor() { }
}
