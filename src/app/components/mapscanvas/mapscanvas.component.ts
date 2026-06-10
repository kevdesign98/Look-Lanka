import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import esriConfig from "@arcgis/core/config";
import * as locator from "@arcgis/core/rest/locator";
import { TripService } from '../../core/trip.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CarouselModule } from 'primeng/carousel';

interface MarkerConfig {
  color: string;
  detailsPath: string;
}

const PIN_OUTER_BACKGROUND_PATH = "M59.715,126.994c15.318,-47.685 47.323,-76.572 96.413,-83.701c61.553,-8.939 117.563,32.758 129.199,92.649c4.742,24.409 1.064,48.015 -6.59,71.269c-6.175,18.76 -14.912,36.329 -24.575,53.493c-1.883,3.344 -4.151,4.176 -7.763,3.379c-21.191,-4.678 -42.651,-7.249 -64.348,-7.772c-3.116,-0.075 -5.491,-0.412 -5.47,-4.544c0.112,-22.331 0.054,-44.663 0.073,-66.995c0.001,-0.968 -0.091,-2.023 1.119,-2.932c3.752,0.293 6.41,2.698 8.706,5.609c1.131,1.434 1.963,3.105 3.102,4.533c1.703,2.136 3.818,3.397 6.481,1.638c2.399,-1.584 2.996,-3.739 1.876,-6.513c-1.777,-4.403 -5.416,-7.46 -8.404,-11.606c4.422,-1.218 7.715,0.786 11.072,2.208c1.678,0.711 3.156,1.909 4.849,2.567c2.406,0.934 4.643,0.466 6.174,-1.79c1.653,-2.436 0.649,-4.585 -1.262,-6.183c-4.579,-3.828 -10.016,-5.869 -15.831,-6.958c-1.769,-0.331 -3.663,-0.217 -5.404,-1.749c2.871,-3.04 6.604,-3.645 10.31,-3.855c3.475,-0.197 6.988,0.077 10.472,0.32c3.27,0.228 5.841,-0.787 6.267,-4.202c0.407,-3.254 -2.087,-4.71 -4.862,-5.351c-8.029,-1.854 -15.884,-1.142 -23.514,1.946c-2.285,0.925 -4.522,1.97 -7.247,3.164c-0.312,-2.875 1.247,-4.418 2.55,-5.975c4.846,-5.794 11.406,-8.491 18.577,-9.921c3.257,-0.65 6.143,-1.965 5.64,-5.656c-0.545,-3.999 -3.724,-4.517 -7.286,-3.934c-6.518,1.067 -12.521,3.346 -17.986,7.058c-1.343,0.912 -2.433,2.326 -4.747,2.302c-1.29,-2.49 -0.447,-5.346 -0.729,-8.033c-0.341,-3.252 -1.376,-6.131 -5.245,-6.007c-3.517,0.113 -4.573,2.843 -4.889,5.892c-0.272,2.621 0.432,5.327 -0.625,7.904c-2.214,0.624 -3.418,-1.1 -4.851,-2.061c-5.201,-3.489 -10.874,-5.718 -17.004,-6.913c-3.756,-0.732 -7.512,-0.807 -8.26,3.818c-0.669,4.138 2.902,4.979 6.126,5.701c6.967,1.559 13.313,4.298 18.047,9.933c1.259,1.498 2.687,2.921 2.804,5.888c-5.727,-2.261 -10.871,-4.858 -16.65,-5.655c-4.726,-0.652 -9.301,-0.386 -13.906,0.42c-3.312,0.58 -5.846,2.252 -5.082,6.025c0.692,3.42 3.358,4.038 6.586,3.658c6.948,-0.819 13.867,-1.098 20.49,3.282c-3.52,2.356 -7.381,1.853 -10.69,3.194c-3.559,1.442 -7.203,2.714 -10.172,5.226c-2.156,1.824 -3.782,4.041 -1.696,6.897c1.935,2.647 4.522,2.596 7.088,1.038c3.596,-2.183 7.36,-3.892 11.501,-4.691c0.953,-0.184 1.98,-0.426 2.952,0.817c-2.017,3.457 -5.375,6.069 -7.277,9.764c-1.552,3.015 -2.185,5.757 1.008,7.893c3.472,2.322 5.553,-0.057 7.349,-2.67c2.824,-4.109 5.683,-8.137 10.879,-9.146c1.801,1.693 1.298,3.463 1.301,5.043c0.044,21.165 -0.066,42.332 0.115,63.496c0.038,4.448 -1.25,6.107 -5.896,6.217c-21.355,0.504 -42.49,3.149 -63.374,7.621c-3.93,0.841 -6.295,0.215 -8.46,-3.61c-14.523,-25.66 -26.663,-52.194 -31.499,-81.578c-2.851,-17.324 -2.273,-34.483 2.47,-51.857";

// 2. CONFIGURAZIONE MAPPA: COLORI E PATH DELLE ICONE INTERNE PER CATEGORIA
const MARKER_CONFIGS: Record<string, MarkerConfig> = {
  beaches: {
    color: "#00A8E8", // Celeste Spiaggia
    detailsPath: "M154.822,279.923c-7.911,-1.592 -14.909,-0.632 -21.308,3.942c-5.288,3.779 -10.926,3.774 -16.38,0.394c-4.453,-2.76 -8.963,-5.054 -14.348,-5.219c-2.488,-0.076 -3.829,-1.642 -4.319,-3.978c18.081,-11.319 122.161,-11.631 146.071,-0.454c-0.076,3.097 -2.066,4.264 -4.796,4.412c-5.007,0.273 -9.265,2.338 -13.409,4.962c-5.767,3.652 -11.522,3.555 -17.282,-0.321c-9.25,-6.223 -18.781,-6.347 -28.102,-0.328c-6.51,4.203 -12.622,4.356 -19.028,-0.034c-2.026,-1.388 -4.46,-2.181 -7.098,-3.378Z M135.92,294.001c8.175,-6.383 15.635,-6.151 24.071,-0.479c7.612,5.118 16.375,4.689 24.06,-0.492c7.262,-4.896 13.765,-5.289 21.126,-0.148c7.035,4.913 14.936,5.079 22.87,1.718c1.154,-0.489 2.19,-1.575 4.708,-0.652c-4.66,6.096 -8.761,12.27 -13.743,17.624c-2.349,2.524 -5.979,0.585 -8.719,-1.18c-4.232,-2.726 -8.509,-5.103 -13.799,-5.232c-5.678,-0.138 -10.922,0.894 -15.615,4.198c-6.343,4.465 -12.502,4.264 -18.988,-0.047c-8.744,-5.811 -17.833,-5.612 -26.849,-0.375c-2.15,1.249 -4.083,2.913 -6.635,3.353c-1.825,0.314 -3.726,0.696 -5.064,-1.062c-4.394,-5.773 -8.74,-11.584 -12.774,-17.99c8.424,3.692 16.63,5"
  },
  hotels: {
    color: "#FF9F1C", // Arancione Hotel
    detailsPath: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" // Esempio di icona 'home' o letto in formato path SVG
  },
  culture: {
    color: "#8338EC", // Viola Tempio/Cultura
    detailsPath: "M12 2L1 7v2h22V7L12 2zm10 8H2v2h20v-2zm-18 4v5h3v-5H4zm6 0v5h3v-5h-3zm6 0v5h3v-5h-3zm4 0v5h3v-5h-3zM2 20v2h20v-2H2z" // Esempio tempio/colonne Greco-Romane
  },
  safari: {
    color: "#2EC4B6", // Verde Safari/Natura
    detailsPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" // Esempio mondo/natura
  },
  food: {
    color: "#E63946", // Rosso Ristorante
    detailsPath: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm4-3v5c0 1.38 1.12 2.5 2.5 2.5v7.5H20v-15c-2.21 0-4 1.79-4 4z" // Esempio forchetta e coltello
  }
};

@Component({
  selector: 'app-mapscanvas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, CarouselModule],
  templateUrl: './mapscanvas.component.html',
  styleUrls: ['./mapscanvas.component.css']
})
export class MapscanvasComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;

  // Usiamo any per evitare l'errore '__esri' senza configurazioni extra
  private view!: any;
  private locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  // --- SIGNALS PER LA REATTIVITÀ ---
  public activeCategory = signal<string>('beaches');
  public selectedLocations = signal<any[]>([]);

  // --- DATABASE HONEST GUIDE ---
  public honestGuide: any = {
    beaches: [
      { id: 1, name: "Mirissa", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1580910531902-1112518b26ea", desc: "Whale watching & Sunset.", scam: "Avoid 'free' shell gifts, they'll ask for money later." },
      { id: 2, name: "Hiriketiya", lat: 5.963211167424435, lng: 80.70857047101882, img: "https://lh5.googleusercontent.com/p/AF1QipPn9DyQ-3r38kfVRSBHKeAomk_msLLxO4S3o9cm=s1600", desc: "The Horseshoe Bay surf.", scam: "Board rentals: Negotiate if more than 800 LKR." },
      { id: 3, name: "Bentota", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1589373797397-d19670f47549?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The old Dutch Fort.", scam: "Local sellers will try to sell you fake jewelry, ignore them." },
      { id: 4, name: "Galle", lat: 6.028, lng: 80.217, img: "https://images.unsplash.com/photo-1579989197111-928f586796a3?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "The sand of Bentota called Paradise Island.", scam: "Watch for is people selling old coins purported to come from ship wrecks" },
      { id: 5, name: "Trincomalee", lat: 8.561, lng: 81.229, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 6, name: "Hikkaduwa", lat: 6.139208758386443, lng: 80.1088162428894, img: "https://images.unsplash.com/photo-1589094643676-9861bb0083ed?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 7, name: "Unawatuna", lat: 6.0168518397473605, lng: 80.24942801731429, img: "https://www.lovesrilanka.org/wp-content/uploads/2019/09/rsz_shutterstock_633543728-min.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 8, name: "Arugam Bay", lat: 6.840792153152532, lng: 81.8321814283158, img: "https://images.unsplash.com/photo-1503384861219-7f20f2f111cc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 9, name: "Tangalle", lat: 6.028958918255749, lng: 80.79411325887794, img: "https://images.unsplash.com/photo-1646894232861-a0ad84f1ad5d?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 10, name: "Nilaveli", lat: 8.702787811239524, lng: 81.18672802605064, img: "https://images.unsplash.com/photo-1695090177375-0351b2314e3a?q=80&w=1151&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      // { id: 11, name: "Uppuveli", lat: 8.608549156271655, lng: 81.22108539651596, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 12, name: "Weligama", lat: 5.973218499357644, lng: 80.4299450918499, img: "https://www.lovesrilanka.org/wp-content/uploads/2020/06/LSL_B2_Taprobane-Island_1920x700.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 13, name: "Jungle Beach", lat: 6.018747316663354, lng: 80.23933273774061, img: "https://d34vm3j4h7f97z.cloudfront.net/original/4X/f/5/4/f543a3dc1e42a92169a6878e397d4ab3869fbea1.jpeg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 14, name: "Secret Beach", lat: 5.950159176188854, lng: 80.45283663579261, img: "https://www.lovesrilanka.org/wp-content/uploads/2020/06/LSL_B2_Secret-Beach_1920x700.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      // { id: 15, name: "Ahangama", lat: 5.968856906629596, lng: 80.36530877339385, img: "https://images.unsplash.com/photo-1720945490877-efff2400cc16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 16, name: "Dehiwala Beach", lat: 6.848660100084868, lng: 79.86090557274728, img: "https://images.unsplash.com/photo-1658919980736-20dab2edea05?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 17, name: "Casuarina Beach", lat: 9.762392013624474, lng: 79.88498776442225, img: "https://www.lovesrilanka.org/wp-content/uploads/2020/04/1920x700-17.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 18, name: "Pasikudah Beach", lat: 7.9303403630393365, lng: 81.56044540036258, img: "https://www.lovesrilanka.org/wp-content/uploads/2020/04/Pasikuda-Bay-1200.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 19, name: "Silent Beach", lat: 6.006050913104819, lng: 80.77703543858556, img: "https://travelnania.com/wp-content/uploads/2024/03/silent-beach-tangalle-sri-lanka-1024x683.jpg.webp", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
      { id: 20, name: "Hummanaya Blow Hole", lat: 5.977876424715162, lng: 80.73956561201119, img: "https://www.lovesrilanka.org/wp-content/uploads/2020/06/LSL_B2_Hummanaya-Blow-Hole_1920x700.jpg", desc: "Whale watching & surf", scam: "Cash Theft in Hotels: The 'Invisible' Scam" },
    ],
    hotels: [
      { id: 300, name: "Heritance Kandalama, Dambulla", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 301, name: "Amanwella, Tangalle", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 302, name: "Wild Coast Tented Lodge, Yala", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 303, name: "Ceylon Tea Trails, Hatton", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 304, name: "Galle Face Hotel, Galle", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 305, name: "Shangri-La Colombo, Colombo", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 306, name: "Cinnamon Grand Colombo, Colombo", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 307, name: "Jetwing Vil Uyana, Sigirya", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 308, name: "Santani Wellness Resort, Kandy", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 309, name: "Cape Weligama, Weligama", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 310, name: "Mandara Resort, Mirissa", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 311, name: "Jetwing Jaffna, Jaffna", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 312, name: "North Gate by Jetwing, Jaffna", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 313, name: "Fox Jaffna by Fox Resorts, Jaffna", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 314, name: "Uga Ulagalla, Anuradhapura", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 315, name: "Heritage Hotel, Anuradhapura", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 316, name: "Uga Jungle Beach, Trincomalee", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 317, name: "Trinco Blu by Cinnamon, Trincomalee", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 318, name: "Karpaha Sands, Kalkudah", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 319, name: "The Blue Lagoon Resort, Kalpitiya", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 320, name: "Koddu Kalpitiya", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." }





    ],
    culture: [
      { id: 400, name: "Sigirya Rock Fortess", lat: 7.9572877049614705, lng: 80.7602248108549, img: "https://images.unsplash.com/photo-1711100358916-c3a93c7a47e2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 401, name: "Dambulla Cave Temple", lat: 7.8550468468595005, lng: 80.65101209060838, img: "https://images.unsplash.com/photo-1582103517762-613cc237349b?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 402, name: "Kandy Lake", lat: 7.292218340797054, lng: 80.64031736357605, img: "https://images.unsplash.com/photo-1716321953086-3e2d2bd88fbe?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 403, name: "Temple of Tooth Relic Kandy", lat: 7.293693356035236, lng: 80.64152506215713, img: "https://images.unsplash.com/photo-1562698013-ac13558052cd?q=80&w=1620&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 404, name: "Galle Fort", lat: 6.030204597284365, lng: 80.2159653162765, img: "https://images.unsplash.com/photo-1745182477654-78fdd25bb944?q=80&w=1686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 405, name: "Anuradhapura Ruins", lat: 8.35095509691603, lng: 80.39834363242501, img: "https://images.unsplash.com/photo-1654529652395-7e97e8e2dffe?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 406, name: "Spice Gardens Matale", lat: 7.454669168380406, lng: 80.64571501031821, img: "https://images.unsplash.com/photo-1682749398549-952020d7b9ac?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 407, name: "Royal Botanical Gardens, Peradeniya", lat: 7.268295719045001, lng: 80.59703016429482, img: "https://images.unsplash.com/photo-1743669946732-d44418cf17ce?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      // { id: 408, name: "Koneswaram Temple Trincomalee", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 409, name: "Nallur Kandaswamy Kovil Jaffna", lat: 9.675008347855105, lng: 80.02973642381627, img: "https://images.unsplash.com/photo-1725680968792-c8dce6d6cf18?q=80&w=872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 410, name: "Polonnaruwa Ancient City", lat: 7.9523298434478855, lng: 81.00537208606417, img: "https://images.unsplash.com/photo-1721992499083-637b6ee0c7ba?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 411, name: "Sri Pada", lat: 6.811006015624631, lng: 80.4997313562662, img: "https://images.unsplash.com/photo-1566893298691-bfd8e0e62e10?q=80&w=1409&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 412, name: "Jaffna Fort", lat: 9.662115631838688, lng: 80.00888617773218, img: "https://images.unsplash.com/photo-1591410448119-1b49cbb3b83e?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 413, name: "Nine Arch Bridge", lat: 6.8773000838020835, lng: 81.06076033476211, img: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
    ],
    safari: [
      { id: 500, name: "Yala National Park", lat: 6.467359636507152, lng: 81.47928391364844, img: "https://images.unsplash.com/photo-1603789764099-52b21a871336?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 501, name: "Wilpattu National Park", lat: 8.468773387033051, lng: 80.07443989177993, img: "https://images.unsplash.com/photo-1705936981588-a4192f66fcfb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 502, name: "Minneriya National Park", lat: 8.017350083198389, lng: 80.84877226714778, img: "https://images.unsplash.com/photo-1729855776050-5d679fe51cc1?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 503, name: "Gal Oya National Park", lat: 7.231855149037933, lng: 81.47659707114859, img: "https://images.unsplash.com/photo-1621847473222-d85c022cbf07?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 504, name: "Udawalawa National Park", lat: 6.449702947848345, lng: 80.8437553285783, img: "https://images.unsplash.com/photo-1719807633728-7ff13f7f2b61?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 505, name: "Wasgamuwa National Park", lat: 7.7546925515602965, lng: 80.92336136857922, img: "https://images.unsplash.com/photo-1635728695734-365b13844d86?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 506, name: "Kaudulla National Park", lat: 8.162001088212634, lng: 80.91577414951834, img: "https://images.unsplash.com/photo-1643793432370-7827fe967b9b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 507, name: "Maduru Oya National Park", lat: 7.647890794022534, lng: 81.1871433625384, img: "https://images.unsplash.com/photo-1730432997123-76a755eb8941?q=80&w=2066&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 508, name: "Bundala National Park", lat: 6.199566024277477, lng: 81.21048589063838, img: "https://images.unsplash.com/photo-1602609712874-78a6c4af4413?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
      { id: 509, name: "Kumana National Park", lat: 6.574067918772033, lng: 81.67378318437858, img: "https://images.unsplash.com/photo-1559038170-eff5b7a7956d?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Leopard sanctuary.", scam: "Shared jeeps should be 6,000-8,000 LKR total." },
    ],
    food: [
      { id: 600, name: "Ministry of Crab, Colombo", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 601, name: "Upali's by Nawaloka, Colombo", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 602, name: "The Gallery Café, Colombo", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 603, name: "The Empire Cafe, Kandy", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 604, name: "Helga's Folly, Kandy", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 605, name: "The Fort Printers, Galle", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 606, name: "Poonie’s Kitchen, Galle", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 607, name: "Jetwing Jaffna Rooftop, Jaffna", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 608, name: "Malayan Cafe, Jaffna", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 609, name: "The Villa Bentota, Bentota", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 610, name: "Dilmah Tea Lounge Chatham Street, Colombo", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 611, name: "Damro Labookellie Tea Centre, Nuwara Eliya", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 612, name: "Geragama Tea Estate, Kandy", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 613, name: "Halpewatte Tea Factory, Ella", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 614, name: "Handunugoda Tea Estate, Galle", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 615, name: "Nihal Family Restaurants, Pasyala & Thihariya", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
      { id: 616, name: "Dewmini Roti Shop, Mirissa", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." },
    ]
  };

  MARKER_CONFIGS: Record<string, MarkerConfig> = {
    beaches: {
      color: "#00A8E8",  // Blu
      detailsPath: `"M59.715,126.994c15.318,-47.685 47.323,-76.572 96.413,-83.701c61.553,-8.939 117.563,32.758 129.199,92.649c4.742,24.409 1.064,48.015 -6.59,71.269c-6.175,18.76 -14.912,36.329 -24.575,53.493c-1.883,3.344 -4.151,4.176 -7.763,3.379c-21.191,-4.678 -42.651,-7.249 -64.348,-7.772c-3.116,-0.075 -5.491,-0.412 -5.47,-4.544c0.112,-22.331 0.054,-44.663 0.073,-66.995c0.001,-0.968 -0.091,-2.023 1.119,-2.932c3.752,0.293 6.41,2.698 8.706,5.609c1.131,1.434 1.963,3.105 3.102,4.533c1.703,2.136 3.818,3.397 6.481,1.638c2.399,-1.584 2.996,-3.739 1.876,-6.513c-1.777,-4.403 -5.416,-7.46 -8.404,-11.606c4.422,-1.218 7.715,0.786 11.072,2.208c1.678,0.711 3.156,1.909 4.849,2.567c2.406,0.934 4.643,0.466 6.174,-1.79c1.653,-2.436 0.649,-4.585 -1.262,-6.183c-4.579,-3.828 -10.016,-5.869 -15.831,-6.958c-1.769,-0.331 -3.663,-0.217 -5.404,-1.749c2.871,-3.04 6.604,-3.645 10.31,-3.855c3.475,-0.197 6.988,0.077 10.472,0.32c3.27,0.228 5.841,-0.787 6.267,-4.202c0.407,-3.254 -2.087,-4.71 -4.862,-5.351c-8.029,-1.854 -15.884,-1.142 -23.514,1.946c-2.285,0.925 -4.522,1.97 -7.247,3.164c-0.312,-2.875 1.247,-4.418 2.55,-5.975c4.846,-5.794 11.406,-8.491 18.577,-9.921c3.257,-0.65 6.143,-1.965 5.64,-5.656c-0.545,-3.999 -3.724,-4.517 -7.286,-3.934c-6.518,1.067 -12.521,3.346 -17.986,7.058c-1.343,0.912 -2.433,2.326 -4.747,2.302c-1.29,-2.49 -0.447,-5.346 -0.729,-8.033c-0.341,-3.252 -1.376,-6.131 -5.245,-6.007c-3.517,0.113 -4.573,2.843 -4.889,5.892c-0.272,2.621 0.432,5.327 -0.625,7.904c-2.214,0.624 -3.418,-1.1 -4.851,-2.061c-5.201,-3.489 -10.874,-5.718 -17.004,-6.913c-3.756,-0.732 -7.512,-0.807 -8.26,3.818c-0.669,4.138 2.902,4.979 6.126,5.701c6.967,1.559 13.313,4.298 18.047,9.933c1.259,1.498 2.687,2.921 2.804,5.888c-5.727,-2.261 -10.871,-4.858 -16.65,-5.655c-4.726,-0.652 -9.301,-0.386 -13.906,0.42c-3.312,0.58 -5.846,2.252 -5.082,6.025c0.692,3.42 3.358,4.038 6.586,3.658c6.948,-0.819 13.867,-1.098 20.49,3.282c-3.52,2.356 -7.381,1.853 -10.69,3.194c-3.559,1.442 -7.203,2.714 -10.172,5.226c-2.156,1.824 -3.782,4.041 -1.696,6.897c1.935,2.647 4.522,2.596 7.088,1.038c3.596,-2.183 7.36,-3.892 11.501,-4.691c0.953,-0.184 1.98,-0.426 2.952,0.817c-2.017,3.457 -5.375,6.069 -7.277,9.764c-1.552,3.015 -2.185,5.757 1.008,7.893c3.472,2.322 5.553,-0.057 7.349,-2.67c2.824,-4.109 5.683,-8.137 10.879,-9.146c1.801,1.693 1.298,3.463 1.301,5.043c0.044,21.165 -0.066,42.332 0.115,63.496c0.038,4.448 -1.25,6.107 -5.896,6.217c-21.355,0.504 -42.49,3.149 -63.374,7.621c-3.93,0.841 -6.295,0.215 -8.46,-3.61c-14.523,-25.66 -26.663,-52.194 -31.499,-81.578c-2.851,-17.324 -2.273,-34.483 2.47,-51.857m62.356,58.278c-4.716,-8.66 -7.278,-17.969 -7.047,-27.781c0.832,-35.401 31.932,-60.774 66.858,-54.773c26.391,4.535 47.194,29.487 46.058,56.162c-1.07,25.114 -13.759,42.495 -36.971,52.119c-3.315,1.375 -6.552,2.982 -5.028,7.123c1.535,4.172 5.161,3.342 8.492,2.161c0.628,-0.223 1.246,-0.473 1.862,-0.727c28.182,-11.622 45.246,-39.719 40.89,-70.162c-4.685,-32.744 -29.833,-55.481 -61.747,-57.184c-25.184,-1.344 -45.341,8.585 -59.166,29.547c-13.937,21.132 -14.932,43.754 -3.704,66.452c7.797,15.761 20.401,26.536 37.068,32.349c4.133,1.442 7.542,-0.138 7.761,-3.474c0.247,-3.761 -2.575,-5.01 -5.513,-6.108c-12.833,-4.798 -22.578,-13.245 -29.813,-25.706Z " +
        "M154.822,279.923c-7.911,-1.592 -14.909,-0.632 -21.308,3.942c-5.288,3.779 -10.926,3.774 -16.38,0.394c-4.453,-2.76 -8.963,-5.054 -14.348,-5.219c-2.488,-0.076 -3.829,-1.642 -4.319,-3.978c18.081,-11.319 122.161,-11.631 146.071,-0.454c-0.076,3.097 -2.066,4.264 -4.796,4.412c-5.007,0.273 -9.265,2.338 -13.409,4.962c-5.767,3.652 -11.522,3.555 -17.282,-0.321c-9.25,-6.223 -18.781,-6.347 -28.102,-0.328c-6.51,4.203 -12.622,4.356 -19.028,-0.034c-2.026,-1.388 -4.46,-2.181 -7.098,-3.378Z " +
        "M135.92,294.001c8.175,-6.383 15.635,-6.151 24.071,-0.479c7.612,5.118 16.375,4.689 24.06,-0.492c7.262,-4.896 13.765,-5.289 21.126,-0.148c7.035,4.913 14.936,5.079 22.87,1.718c1.154,-0.489 2.19,-1.575 4.708,-0.652c-4.66,6.096 -8.761,12.27 -13.743,17.624c-2.349,2.524 -5.979,0.585 -8.719,-1.18c-4.232,-2.726 -8.509,-5.103 -13.799,-5.232c-5.678,-0.138 -10.922,0.894 -15.615,4.198c-6.343,4.465 -12.502,4.264 -18.988,-0.047c-8.744,-5.811 -17.833,-5.612 -26.849,-0.375c-2.15,1.249 -4.083,2.913 -6.635,3.353c-1.825,0.314 -3.726,0.696 -5.064,-1.062c-4.394,-5.773 -8.74,-11.584 -12.774,-17.99c8.424,3.692 16.63,5.231 25.352,0.766Z " +
        "M148.943,331.244c-8.339,2.045 -12.91,-1.861 -15.915,-8.608c11.689,-9.504 16.498,-9.606 26.215,-3.314c7.901,5.116 16.656,5.089 24.58,-0.034c9.832,-6.356 14.28,-6.005 25.813,3.126c-2.857,7.383 -5.391,9.251 -12.575,8.815c-5.853,-0.355 -11.256,0.733 -16.108,4.138c-6.527,4.58 -12.938,4.447 -19.403,-0.255c-3.582,-2.604 -7.684,-3.931 -12.608,-3.867Z " +
        "M152.074,345.968c-1.079,-1.406 -2.587,-2.16 -2.455,-4.609c7.795,0.977 13.272,7.644 21.536,7.646c8.351,0.001 14.121,-5.97 22.022,-7.017c-6.445,8.799 -13.6,16.726 -21.637,24.374c-7.168,-6.48 -12.961,-13.543 -19.466,-20.394Z";`
    },
    hotels: {
      color: "#e67e22", // Arancione (esempio)
      detailsPath: `M... (Incolla qui solo i path interni dell'icona hotel che esporterai)`
    },
    food: {
      color: "#2ecc71", // Verde (esempio)
      detailsPath: `M... (Incolla qui solo i path interni dell'icona cibo/ristorante)`
    },
    culture: {
      color: "#9b59b6", // Viola (esempio)
      detailsPath: `M... (Incolla qui solo i path interni dell'icona tempio/cultura)`
    }
  };


  // Calcola automaticamente gli item per il carousel in base alla categoria
  public currentItems = computed(() => this.honestGuide[this.activeCategory()]);

  constructor(private zone: NgZone, private router: Router, private tripService: TripService) { }

  // ngOnInit() {
  //   esriConfig.assetsPath = "https://js.arcgis.com/5.0/@arcgis/core/assets";
  //   this.initMap();
  // }



  ngOnInit() { this.initMap(); }



  private initMap() {
    this.zone.runOutsideAngular(() => {
      this.view = new MapView({
        container: this.mapViewEl.nativeElement,
        map: new Map({ basemap: "topo-vector" }),
        center: [80.7718, 7.8731],
        zoom: 8,
        ui: { components: [] }
      });

      this.view.when(() => {
        this.updateMarkers();

        window.addEventListener('resize', () => {
          if (this.view) this.view.container = this.mapViewEl.nativeElement;
        });

        this.view.on("click", (e: any) => this.handleMapClick(e));
        this.zone.run(() => this.view.ui.add("zoom", "bottom-right"));
      });
    });
  }

  // --- METODI PUBBLICI PER L'HTML ---

  public setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.updateMarkers();
  }

  public goToPoint(lat: number, lng: number) {
    if (!this.view) return;
    this.view.goTo({ center: [lng, lat], zoom: 12 }, { duration: 1500 });
  }

  public removeFromTrip(id: number) {
    const loc = this.selectedLocations().find(l => l.id === id);
    if (loc?.graphic) this.view.graphics.remove(loc.graphic);
    this.selectedLocations.update(list => list.filter(l => l.id !== id));
  }

  public async confirmTrip() {
    const locations = this.selectedLocations();
    if (locations.length === 0) return;
    try {
      const simplified = locations.map(loc => ({
        name: loc.name,
        lat: (loc.graphic.geometry as any).latitude,
        lon: (loc.graphic.geometry as any).longitude
      }));
      await this.tripService.saveItinerary(simplified);
      this.router.navigate(['/my-trip']);
    } catch (e) { console.error("Save error:", e); }
  }

  // --- LOGICA INTERNA ---


  private updateMarkers(): void {
    if (!this.view) return;

    // 1. Pulisce i vecchi grafici sulla mappa
    this.view.graphics.removeAll();

    // 2. Conserva sulla mappa le posizioni eventualmente già salvate dall'utente
    this.selectedLocations().forEach(loc => this.view.graphics.add(loc.graphic));

    // 3. Estrae il valore corrente del Signal della categoria attiva
    const currentCat = this.activeCategory();
    const config = MARKER_CONFIGS[currentCat] || MARKER_CONFIGS['beaches'];

    // 4. Seleziona l'array di dati corretto dalla honestGuide
    const data = this.honestGuide[currentCat] || [];

    // 5. Cicla i dati e mappa i pin dinamici a 2 strati
    data.forEach((item: any) => {
      const point = new Point({ longitude: item.lng, latitude: item.lat });

      const pinSize = "44px";
      const commonYOffset = "22px";

      // STRATO INFERIORE: Sfondo a Goccia (Colore dinamico per categoria)
      const pinBackground = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          style: "path",
          path: PIN_OUTER_BACKGROUND_PATH,
          color: config.color,
          size: pinSize,
          xoffset: 0,
          yoffset: commonYOffset,
          outline: { color: "#ffffff", width: 1.5 }
        } as any
      });

      // STRATO SUPERIORE: Icona interna (Path dinamico, colore fisso bianco)
      const pinDetails = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          style: "path",
          path: config.detailsPath,
          color: "#ffffff",
          size: pinSize,
          xoffset: 0,
          yoffset: commonYOffset,
          outline: null
        } as any,
        attributes: { ...item, IsStatic: true }
      });

      // Spinge la coppia coordinata di grafici sulla mappa ArcGIS
      this.view.graphics.addMany([pinBackground, pinDetails]);
    });
  }


  private async handleMapClick(event: any) {
    const response = await this.view.hitTest(event);
    const hit = response.results.find((r: any) => r.type === "graphic" && r.graphic.attributes?.IsStatic) as any;
    if (hit) {
      this.addLocationToTrip(hit.graphic.geometry, hit.graphic.attributes.name);
      return;
    }

    // Reverse Geocoding se clicco sul vuoto
    try {
      const res = await locator.locationToAddress(this.locatorUrl, { location: event.mapPoint }) as any;
      const cityName = res?.attributes?.City || `Point (${event.mapPoint.latitude.toFixed(2)})`;
      this.addLocationToTrip(event.mapPoint, cityName.split(',')[0].trim());
    } catch (e) {
      this.addLocationToTrip(event.mapPoint, `Point (${event.mapPoint.latitude.toFixed(2)})`);
    }
  }

  private addLocationToTrip(point: any, name: string) {
    if (this.selectedLocations().some(l => l.name === name)) return;

    const marker = new Graphic({
      geometry: point,
      symbol: { type: "simple-marker", color: "#FF385C", outline: { color: "white", width: 2 }, size: "14px" } as any
    });

    this.view.graphics.add(marker);
    this.zone.run(() => {
      this.selectedLocations.update(prev => [...prev, { id: Date.now(), name, graphic: marker }]);
    });
  }

  ngOnDestroy() { if (this.view) this.view.destroy(); }
}