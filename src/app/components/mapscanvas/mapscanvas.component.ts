import { Component, OnInit, ViewChild, ElementRef, NgZone, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

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
  selectedLocations = signal<any[]>([]);

  constructor(private zone: NgZone) { }

  ngOnInit() {
    // Assets allineati alla versione 5.x
    esriConfig.assetsPath = "https://js.arcgis.com/5.0/@arcgis/core/assets";

    this.zone.runOutsideAngular(() => {
      const map = new Map({
        basemap: "topo-vector"
      });

      this.view = new MapView({
        container: this.mapViewEl.nativeElement,
        map: map,
        center: [80.7718, 7.8731],
        zoom: 7,
        resizeAlign: "center",
        ui: { components: [] as any } // UI vuota all'inizio per evitare errori appendChild
      });

      this.view.when(() => {
        console.log("BACKUP: Mappa caricata con successo!");

        // Aggiungiamo i componenti UI solo quando il DOM è pronto
        this.zone.run(() => {
          this.view.ui.add("zoom", "top-left");
          this.view.ui.add("attribution", "bottom-right");
        });
      });
    });
  }

  removeFromTrip(id: number) {
    // Aggiorniamo il signal filtrando l'array
    this.selectedLocations.update(locations =>
      locations.filter(loc => loc.id !== id)
    );
    console.log(`Rimosso luogo con ID: ${id}`);
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.destroy();
    }
  }
}