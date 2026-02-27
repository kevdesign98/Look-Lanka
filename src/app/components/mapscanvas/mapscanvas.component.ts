import { Component, OnInit, ElementRef, ViewChild, OnDestroy, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Search from '@arcgis/core/widgets/Search';

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

  constructor(private zone: NgZone) { }

  selectedLocations = signal<any[]>([]);

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const map = new Map({
        basemap: 'topo-vector'
      });

      this.view = new MapView({
        container: this.mapViewEl.nativeElement,
        map: map,
        center: [80.7718, 7.8731],
        zoom: 7,
        resizeAlign: "center",
        spatialReference: SpatialReference.WebMercator,
        // FIX PER L'ERRORE TS2322: Usiamo il casting "as any" per bypassare il controllo rigido
        ui: {
          components: ["attribution" as any]
        },
        constraints: {
          rotationEnabled: false,
          minZoom: 6,
          maxZoom: 15,
          geometry: {
            type: "extent",
            xmin: 78.5, ymin: 4.5, xmax: 83.0, ymax: 11.0,
            spatialReference: { wkid: 4326 }
          }
        }
      });

      // IMPORTANTE: Aspettiamo che la vista sia pronta prima di aggiungere widget o interazioni
      this.view.when(() => {
        this.zone.runOutsideAngular(() => {
          // Creiamo il widget qui dentro così siamo sicuri che il DOM sia pronto
          const searchWidget = new Search({
            view: this.view,
            allPlaceholder: "Search a place in Sri Lanka",
            includeDefaultSources: true
          });

          // Aggiungiamo il widget alla UI
          this.view.ui.add(searchWidget, "top-right");

          // Inizializziamo le interazioni
          this.setupInteraction(searchWidget);
        });

        // Piccolo trucco per forzare il rendering se la mappa sembra "vuota"
        setTimeout(() => {
          if (this.view) this.view.tryFatalErrorRecovery();
        }, 500);
      });
    });
  }

  private setupInteraction(searchWidget: Search) {
    this.view.on('click', (event) => {
      this.view.hitTest(event).then((response) => {
        // Se non becchiamo un marker esistente, aggiungiamo un nuovo punto
        if (response.results.length === 0) {
          this.zone.run(() => this.createNewUserMarker(event.mapPoint));
        }
      });
    });

    searchWidget.on("select-result", (event: any) => {
      this.zone.run(() => {
        // Prendiamo il nome reale dal risultato della ricerca
        this.createNewUserMarker(event.result.feature.geometry, event.result.name);
      });
    });
  }

  private createNewUserMarker(point: any, name?: string) {
    const newLoc = {
      id: Date.now(),
      name: name || `Location ${this.selectedLocations().length + 1}`,
      coords: [point.longitude, point.latitude]
    };

    const graphic = new Graphic({
      geometry: point,
      attributes: newLoc,
      symbol: {
        type: 'simple-marker',
        style: 'diamond',
        color: [37, 99, 235], // Blu scuro professionale
        size: 14,
        outline: { color: [255, 255, 255], width: 2 }
      } as any
    });

    this.view.graphics.add(graphic);
    this.addToTrip(newLoc);
  }

  addToTrip(loc: any) {
    this.selectedLocations.update(list => [...list, loc]);
  }

  removeFromTrip(id: number) {
    this.selectedLocations.update(list => list.filter(l => l.id !== id));
    const graphicToRemove = this.view.graphics.toArray().find(g => g.attributes?.id === id);
    if (graphicToRemove) {
      this.view.graphics.remove(graphicToRemove);
    }
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.destroy();
    }
  }
}