import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

// Definiamo un'interfaccia per i nostri luoghi per avere un codice più pulito
interface TravelLocation {
  id: number;
  name: string;
  position: google.maps.LatLngLiteral;
  type: string;
}

@Component({
  selector: 'app-mapscanvas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, GoogleMap, MapAdvancedMarker],
  templateUrl: './mapscanvas.component.html',
  styleUrls: ['./mapscanvas.component.css']
})
export class MapscanvasComponent {
  // Configurazione Mappa
  center: google.maps.LatLngLiteral = { lat: 7.8731, lng: 80.7718 };
  zoom = 8;

  // Opzioni della mappa: il mapId è OBBLIGATORIO per gli Advanced Markers
  mapOptions: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID', // Sostituisci con il tuo Map ID reale dalla Google Cloud Console
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false
  };

  // Database locale dei Marker (puoi aggiungerne quanti ne vuoi)
  markers = signal<TravelLocation[]>([
    { id: 1, name: 'Sigiriya Rock', position: { lat: 7.9570, lng: 80.7603 }, type: 'Culture' },
    { id: 2, name: 'Nine Arch Bridge', position: { lat: 6.8768, lng: 81.0610 }, type: 'Nature' },
    { id: 3, name: 'Temple of the Tooth', position: { lat: 7.2936, lng: 80.6413 }, type: 'Spiritual' },
    { id: 4, name: 'Mirissa Beach', position: { lat: 5.9483, lng: 80.4716 }, type: 'Beach' }
  ]);

  // Signal per gestire i luoghi selezionati dall'utente (la sidebar)
  selectedLocations = signal<TravelLocation[]>([]);

  // Funzione per aggiungere un luogo all'itinerario
  addToTrip(location: TravelLocation) {
    const current = this.selectedLocations();
    // Evitiamo di aggiungere lo stesso posto due volte
    if (!current.find(l => l.id === location.id)) {
      this.selectedLocations.update(list => [...list, location]);
    }
  }

  // Funzione per rimuovere un luogo dall'itinerario
  removeFromTrip(locationId: number) {
    this.selectedLocations.update(list => list.filter(l => l.id !== locationId));
  }
}