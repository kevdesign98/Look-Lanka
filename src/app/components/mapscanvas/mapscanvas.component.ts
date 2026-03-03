import { Component, OnInit, ViewChild, ElementRef, NgZone, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Graphic from "@arcgis/core/Graphic";
import * as locator from "@arcgis/core/rest/locator"; // Per i nomi dei luoghi
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { TripService } from '../../core/trip.service';

@Component({
  selector: 'app-mapscanvas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './mapscanvas.component.html',
  styleUrls: ['./mapscanvas.component.css']
})
export class MapscanvasComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  private view!: MapView;
  private locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  selectedLocations = signal<any[]>([]);

  constructor(private zone: NgZone, private router: Router, private tripService: TripService) { }

  ngOnInit() {
    esriConfig.assetsPath = "https://js.arcgis.com/5.0/@arcgis/core/assets";

    this.zone.runOutsideAngular(() => {
      const map = new Map({ basemap: "topo-vector" });
      this.view = new MapView({
        container: this.mapViewEl.nativeElement,
        map: map,
        center: [80.7718, 7.8731],
        zoom: 7,
        ui: { components: [] as any }
      });

      this.view.when(() => {
        this.view.on("click", (event) => this.handleMapClick(event));
        this.zone.run(() => this.view.ui.add("zoom", "top-left"));
      });
    });
  }

  async handleMapClick(event: any) {
    const lat = event.mapPoint.latitude;
    const lon = event.mapPoint.longitude;

    try {
      const response = await locator.locationToAddress(this.locatorUrl, {
        location: event.mapPoint
      });

      const res = response as any;
      // Priorità: Nome Città -> Nome Quartiere -> Nome Regione -> Fallback coordinate
      const cityName = res?.attributes?.City ||
        res?.attributes?.Neighborhood ||
        res?.attributes?.Region ||
        res?.address ||
        `Punto ${lat.toFixed(2)}`;

      // Puliamo il nome: se per caso esce qualcosa con virgole, prendiamo solo la prima parte
      const cleanName = cityName.split(',')[0].trim();

      this.addLocationToTrip(event.mapPoint, cleanName);
    } catch (error) {
      this.addLocationToTrip(event.mapPoint, `Destinazione (${lat.toFixed(2)})`);
    }
  }

  addLocationToTrip(point: any, name: string) {
    const newId = Date.now();
    const marker = new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        color: "#10b981", // Un bel verde smeraldo per richiamare lo Sri Lanka!
        outline: { color: "white", width: 3 },
        size: "14px",
        style: "circle"
      } as any
    });

    this.view.graphics.add(marker);

    this.zone.run(() => {
      this.selectedLocations.update(prev => [...prev, { id: newId, name, graphic: marker }]);
    });
  }

  removeFromTrip(id: number) {
    const loc = this.selectedLocations().find(l => l.id === id);
    if (loc?.graphic) this.view.graphics.remove(loc.graphic);

    this.selectedLocations.update(list => list.filter(l => l.id !== id));
  }
  async confirmTrip() {
    const locations = this.selectedLocations();

    if (locations.length === 0) {
      alert("Seleziona almeno una tappa prima di confermare!");
      return;
    }

    try {
      // 1. Pulizia dati con controllo di sicurezza (evita la pagina bianca se graphic è null)
      const simplifiedStops = locations.map(loc => {
        if (!loc.graphic || !loc.graphic.geometry) {
          console.warn("Marker senza geometria trovato:", loc);
          return null;
        }
        // ArcGIS 5.x usa oggetti geometry che hanno x/y o latitude/longitude
        const geom = loc.graphic.geometry as any;
        return {
          name: loc.name || 'Punto senza nome',
          lat: geom.latitude || geom.y,
          lon: geom.longitude || geom.x
        };
      }).filter(stop => stop !== null); // Rimuove eventuali punti corrotti

      if (simplifiedStops.length === 0) throw new Error("Nessuna coordinata valida trovata.");

      // 2. Salvataggio su Firebase
      console.log("Salvataggio in corso...", simplifiedStops);
      await this.tripService.saveItinerary(simplifiedStops);

      // 3. Effetto visivo (opzionale se vai subito in dashboard, ma carino)
      if (this.view) {
        const graphics = locations.map(l => l.graphic).filter(g => g !== undefined);
        await this.view.goTo(graphics, { duration: 1000 });
      }

      // 4. Feedback e Navigazione
      // Usiamo setTimeout per dare tempo al database di "respirare" prima del cambio pagina
      setTimeout(() => {
        this.router.navigate(['/my-trip']);
      }, 500);

    } catch (error) {
      console.error("Errore critico durante il salvataggio:", error);
      alert("C'è stato un problema nel salvataggio. Controlla la console.");
    }
  }

  // confirmTrip() {
  //   const locations = this.selectedLocations();

  //   if (locations.length === 0) {
  //     alert("Seleziona almeno una tappa prima di confermare!");
  //     return;
  //   }

  //   console.log("Viaggio Confermato!", locations);

  //   const graphics = locations.map(l => l.graphic);
  //   this.view.goTo(graphics).then(() => {
  //     alert(`Ottimo! Il tuo itinerario di ${locations.length} tappe in Sri Lanka è stato salvato.`);


  //   });
  // }

  ngOnDestroy() { if (this.view) this.view.destroy(); }
}