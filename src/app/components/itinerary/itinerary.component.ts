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
  isModalOpen = signal(false);
  tripToDelete = signal<string | null>(null);

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
      console.error("Error loading trips:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout() {
    await this.authService.logout();
  }

  // async removeTrip(tripId: string) {
  //   if (confirm('Are you sure you want to delete this itinerary?')) {
  //     try {
  //       await this.tripService.deleteTrip(tripId);
  //        this.trips.set(this.trips().filter(t => t.id !== tripId));
  //     } catch (error) {
  //       console.error("Error deleting trip:", error);
  //       alert("It was not possible to delete the trip. Please try again.");
  //     }
  //   }
  // }

  removeTrip(tripId: string) {
    this.tripToDelete.set(tripId); // Salva l'ID del viaggio da eliminare
    this.isModalOpen.set(true);    // Apre il tuo modal personalizzato
  }

  // 2. Questa funzione viene chiamata dal tasto "Delete" dentro il tuo Modal
  async confirmDelete() {
    const id = this.tripToDelete();
    if (id) {
      try {
        await this.tripService.deleteTrip(id);
        // Rimuove il viaggio dalla lista visibile
        this.trips.set(this.trips().filter(t => t.id !== id));
        this.closeModal(); // Chiude il modal dopo l'eliminazione
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
      }
    }
  }

  openDeleteModal(id: string) {
    this.tripToDelete.set(id);
    this.isModalOpen.set(true);
  }

  // async confirmDelete() {
  //   const id = this.tripToDelete();
  //   if (id) {
  //     await this.tripService.deleteTrip(id);
  //     this.trips.set(this.trips().filter(t => t.id !== id));
  //     this.closeModal(); // 
  //   }
  // }

  closeModal() {
    this.isModalOpen.set(false);
    this.tripToDelete.set(null);
  }
}