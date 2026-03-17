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
      { id: 2, name: "Hiriketiya", lat: 5.963211167424435, lng: 80.70857047101882, img: "https://lh5.googleusercontent.com/p/AF1QipPn9DyQ-3r38kfVRSBHKeAomk_msLLxO4S3o9cm=s1600", desc: "The Horseshoe Bay surf.", scam: "Board rentals: Negotiate if more than 800 LKR." },
      { id: 3, name: "Bentota", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1589373797397-d19670f47549?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The old Dutch Fort.", scam: "Local sellers will try to sell you fake jewelry, ignore them." },
      { id: 4, name: "Galle", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1579989197111-928f586796a3?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The sand of Bentota called Paradise Island.", scam: "Watch for is people selling old coins purported to come from ship wrecks" },
      { id: 5, name: "Trincomalee", lat: 8.561, lng: 81.229, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 6, name: "Hikkaduwa", lat: 6.139208758386443, lng: 80.1088162428894, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 7, name: "Unawatuna", lat: 6.0168518397473605, lng: 80.24942801731429, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 8, name: "Arugam Bay", lat: 6.840792153152532, lng: 81.8321814283158, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 9, name: "Tangalle", lat: 6.028958918255749, lng: 80.79411325887794, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 10, name: "Nilaveli", lat: 8.702787811239524, lng: 81.18672802605064, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 11, name: "Uppuveli", lat: 8.608549156271655, lng: 81.22108539651596, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 12, name: "Weligama", lat: 5.973218499357644, lng: 80.4299450918499, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 13, name: "Jungle Beach", lat: 6.018747316663354, lng: 80.23933273774061, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 14, name: "Secret Beach", lat: 5.950159176188854, lng: 80.45283663579261, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 15, name: "Ahangama", lat: 5.968856906629596, lng: 80.36530877339385, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 16, name: "Dehiwala Beach", lat: 6.848660100084868, lng: 79.86090557274728, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 17, name: "Casaurina Beach", lat: 9.762392013624474, lng: 79.88498776442225, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 18, name: "Pasikudah Beach", lat: 7.9303403630393365, lng: 81.56044540036258, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 19, name: "Silent Beach", lat: 6.006050913104819, lng: 80.77703543858556, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 20, name: "Hummanaya Blow Hole", lat: 5.977876424715162, lng: 80.73956561201119, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
    ],
    hotels: [
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." }
    ],
    culture: [
      { id: 400, name: "Kandy", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." }
    ],
    safari: [
      { id: 500, name: "Yala National Park", lat: 6.365, lng: 81.522, img: "https://images.unsplash.com/photo-1705936981588-a4192f66fcfb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." }
    ],
    food: [
      { id: 600, name: "Dewmini Roti Shop", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." }
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

  private addPhotoMarkers() {
    this.honestGuide.beaches.forEach(beach => {
      const point = new Point({ longitude: beach.lng, latitude: beach.lat });

      // 1. IL PIN BIANCO (La cornice a goccia)
      const pinOutline = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          path: "M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z", // Path SVG di un pin
          color: "white",
          outline: { color: "#10b981", width: 2 },
          size: "42px",
          yoffset: "21px" // Alza il pin così la punta tocca le coordinate esatte
        } as any
      });

      // 2. LA FOTO (Il contenuto circolare)
      const photoCircle = new Graphic({
        geometry: point,
        symbol: {
          type: "picture-marker",
          url: beach.img,
          width: "30px",
          height: "30px",
          yoffset: "25px" // Leggermente più su della punta per centrarla nel pin
        } as any,
        attributes: { ...beach, IsStatic: true },
        popupTemplate: {
          title: "🏖️ {name}",
          content: `
          <div style="text-align:center;">
            <img src="{img}" style="width:100%; border-radius:8px; margin-bottom:8px;">
            <p><b>Honest Tip:</b> {scam}</p>
          </div>`
        }
      });

      // Aggiungiamo entrambi: l'ordine conta (la foto deve stare sopra)
      this.view.graphics.addMany([pinOutline, photoCircle]);
    });
  }

  private addStaticMarkers() {
    // 1. SPIAGGE CON FOTO (Wow effect)
    this.honestGuide.beaches.forEach(beach => {
      const graphic = new Graphic({
        geometry: new Point({ longitude: beach.lng, latitude: beach.lat }),
        symbol: {
          type: "picture-marker",
          url: beach.img,
          width: "48px",
          height: "48px"
        } as any,
        attributes: { Name: beach.name, Tip: beach.scam || beach.desc, Image: beach.img, IsStatic: true },
        popupTemplate: {
          title: "🏖️ {Name}",
          content: `
            <div style="text-align:center;">
              <img src="{Image}" style="width:100%; border-radius:12px; margin-top:8px; height:120px; object-fit:cover;">
              <p style="font-size:11px; color:#10b981; font-weight:bold; margin-top:10px;">HONEST SCAM ALERT</p>
              <p style="font-size:13px; color:#475569;">{Tip}</p>
            </div>`
        }
      });
      this.view.graphics.add(graphic);
    });

    // 2. ALTRE CATEGORIE (Standard Markers)
    const others = [
      { data: this.honestGuide.hotels, color: "#6366f1", icon: "🏨" },
      { data: this.honestGuide.safari, color: "#eab308", icon: "🐘" },
      { data: this.honestGuide.food, color: "#f97316", icon: "🍲" }
    ];

    others.forEach(cat => {
      cat.data.forEach(place => {
        const g = new Graphic({
          geometry: new Point({ longitude: place.lng, latitude: place.lat }),
          symbol: {
            type: "simple-marker",
            color: cat.color,
            outline: { color: "white", width: 2 },
            size: "14px"
          } as any,
          attributes: { Name: place.name, Tip: place.scam, IsStatic: true },
          popupTemplate: {
            title: `${cat.icon} {Name}`,
            content: `<p style="font-size:12px;">{Tip}</p>`
          }
        });
        this.view.graphics.add(g);
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
      const res = await locator.locationToAddress(this.locatorUrl, { location: event.mapPoint }) as any;
      const cityName = res?.attributes?.City || res?.attributes?.Region || `Point (${lat.toFixed(2)})`;
      this.addLocationToTrip(event.mapPoint, cityName.split(',')[0].trim());
    } catch (error) {
      this.addLocationToTrip(event.mapPoint, `Point (${lat.toFixed(2)})`);
    }
  }

  addLocationToTrip(point: any, name: string) {
    const alreadySelected = this.selectedLocations().some(loc => loc.name === name);
    if (alreadySelected) return;

    const marker = new Graphic({
      geometry: point,
      symbol: { type: "simple-marker", color: "#006dfa", outline: { color: "white", width: 2 }, size: "12px" } as any
    });

    this.view.graphics.add(marker);
    this.zone.run(() => {
      this.selectedLocations.update(prev => [...prev, { id: Date.now(), name, graphic: marker }]);
    });
  }

  removeFromTrip(id: number) {
    const loc = this.selectedLocations().find(l => l.id === id);
    if (loc?.graphic) this.view.graphics.remove(loc.graphic);
    this.selectedLocations.update(list => list.filter(l => l.id !== id));
  }

  async confirmTrip() {
    const locations = this.selectedLocations();
    if (locations.length === 0) return;

    try {
      const simplified = locations.map(loc => {
        const geom = loc.graphic.geometry as any;
        return { name: loc.name, lat: geom.latitude || geom.y, lon: geom.longitude || geom.x };
      });
      await this.tripService.saveItinerary(simplified);
      this.router.navigate(['/my-trip']);
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() { if (this.view) this.view.destroy(); }
}