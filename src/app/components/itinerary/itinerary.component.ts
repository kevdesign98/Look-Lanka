import { Component, OnInit, inject, signal } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { TripService } from '../../core/trip.service'; // Assicurati che il path sia corretto
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, RouterLink],
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.css'
})
export class ItineraryComponent implements OnInit {
  authService = inject(AuthService);
  tripService = inject(TripService); // Iniettiamo il servizio dei viaggi

  // Signal per memorizzare i viaggi recuperati da Firebase
  trips = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadUserTrips();
  }

  async loadUserTrips() {
    this.isLoading.set(true);
    try {
      // Chiamiamo il metodo del service (che andremo a definire sotto)
      const savedTrips = await this.tripService.getTrips();
      this.trips.set(savedTrips);
    } catch (error) {
      console.error("Errore nel caricamento dei viaggi:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout() {
    await this.authService.logout();
  }

  async removeTrip(tripId: string) {
    if (confirm('Sei sicuro di voler eliminare questo itinerario?')) {
      try {
        await this.tripService.deleteTrip(tripId);
        // Aggiorniamo la lista locale rimuovendo il viaggio eliminato
        this.trips.set(this.trips().filter(t => t.id !== tripId));
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert("Non è stato possibile eliminare il viaggio. Riprova.");
      }
    }
  }
}