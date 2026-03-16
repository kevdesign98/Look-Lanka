import { Component, OnInit, ViewChild, ElementRef, NgZone, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import * as locator from "@arcgis/core/rest/locator";
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { TripService } from '../../core/trip.service';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-mapscanvas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, CarouselModule],
  templateUrl: './mapscanvas.component.html',
  styleUrls: ['./mapscanvas.component.css']
})
export class MapscanvasComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  private view!: MapView;
  private locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  // DATABASE CURATO (Modello TripAdvisor - Honest Edition)
  honestGuide = {
    beaches: [
      { id: 1, name: "Mirissa", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1580910531902-1112518b26ea", desc: "Whale watching & Sunset.", scam: "Avoid 'free' shell gifts, they'll ask for money later." },
      { id: 2, name: "Hiriketiya", lat: 5.926, lng: 80.709, img: "https://lh5.googleusercontent.com/p/AF1QipPn9DyQ-3r38kfVRSBHKeAomk_msLLxO4S3o9cm=s1600", desc: "The Horseshoe Bay surf.", scam: "Board rentals: Negotiate if more than 800 LKR." },
      { id: 3, name: "Bentota", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1589373797397-d19670f47549?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The old Dutch Fort.", scam: "Local sellers will try to sell you fake jewelry, ignore them." },
      { id: 4, name: "Galle", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1579989197111-928f586796a3?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The sand of Bentota called Paradise Island.", scam: "Watch for is people selling old coins purported to come from ship wrecks" },
      { id: 5, name: "Trincomalee", lat: 8.561, lng: 81.229, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
    ],
    hotels: [
      { id: 3, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." }
    ],
    safari: [
      { id: 4, name: "Yala National Park", lat: 6.365, lng: 81.522, img: "https://images.unsplash.com/photo-1705936981588-a4192f66fcfb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." }
    ],
    food: [
      { id: 5, name: "Dewmini Roti Shop", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." }
    ]
  };

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1,
      loop: true
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1,
      loop: true
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1,
      loop: true
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
      loop: true
    }
  ];

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
        zoom: 8,
        ui: { components: [] as any }
      });

      this.view.when(() => {
        this.addStaticMarkers();
        this.view.on("click", (event) => this.handleMapClick(event));
        this.zone.run(() => this.view.ui.add("zoom", "bottom-right"));
      });
    });
  }

  // NUOVO: Metodo per navigare verso un punto dal Carousel
  goToPoint(lat: number, lng: number) {
    if (!this.view) return;
    this.view.goTo({
      center: [lng, lat],
      zoom: 12
    }, { duration: 1500 });
  }

  private addStaticMarkers() {
    // Uniamo tutte le categorie per creare i marker
    const categories = [
      { data: this.honestGuide.beaches, color: "#10b981", icon: "🏖️" },
      { data: this.honestGuide.hotels, color: "#6366f1", icon: "🏨" },
      { data: this.honestGuide.safari, color: "#eab308", icon: "🐘" },
      { data: this.honestGuide.food, color: "#f97316", icon: "🍲" }
    ];

    categories.forEach(cat => {
      cat.data.forEach(place => {
        const graphic = new Graphic({
          geometry: new Point({ longitude: place.lng, latitude: place.lat }),
          symbol: {
            type: "simple-marker",
            color: cat.color,
            outline: { color: "white", width: 2 },
            size: "12px"
          } as any,
          attributes: {
            Name: place.name,
            Tip: place.scam || place.desc,
            IsStatic: true
          },
          popupTemplate: {
            title: `${cat.icon} {Name}`,
            content: `<div style="padding:5px;">
                        <p style="font-size:11px; color:#e11d48; font-weight:bold; margin-bottom:4px;">⚠️ HONEST TIP</p>
                        <p style="font-size:12px; color:#475569;">{Tip}</p>
                      </div>`
          }
        });
        this.view.graphics.add(graphic);
      });
    });
  }

  async handleMapClick(event: any) {
    const response = await this.view.hitTest(event);
    const staticGraphic = response.results.find((r: any) => r.graphic?.attributes?.IsStatic) as any;

    if (staticGraphic) {
      const attr = staticGraphic.graphic.attributes;
      this.addLocationToTrip(staticGraphic.graphic.geometry, attr.Name);
      return;
    }

    const lat = event.mapPoint.latitude;
    try {
      const response = await locator.locationToAddress(this.locatorUrl, { location: event.mapPoint });
      const res = response as any;
      const cityName = res?.attributes?.City || res?.attributes?.Region || `Point (${lat.toFixed(2)})`;
      this.addLocationToTrip(event.mapPoint, cityName.split(',')[0].trim());
    } catch (error) {
      this.addLocationToTrip(event.mapPoint, `Destination (${lat.toFixed(2)})`);
    }
  }

  addLocationToTrip(point: any, name: string) {
    const alreadySelected = this.selectedLocations().some(loc => loc.name === name);
    if (alreadySelected) return;

    const newId = Date.now();
    const marker = new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        color: "#006dfa",
        outline: { color: "#ffffff", width: 2 },
        size: "12px",
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
      alert("Please select at least one stage!");
      return;
    }

    try {
      const simplifiedStops = locations.map(loc => {
        const geom = loc.graphic.geometry as any;
        return {
          name: loc.name,
          lat: geom.latitude || geom.y,
          lon: geom.longitude || geom.x
        };
      });
      await this.tripService.saveItinerary(simplifiedStops);
      if (this.view) await this.view.goTo(locations.map(l => l.graphic), { duration: 1000 });
      setTimeout(() => this.router.navigate(['/my-trip']), 500);
    } catch (error) {
      alert("A problem occurred during saving.");
    }
  }

  ngOnDestroy() { if (this.view) this.view.destroy(); }
}