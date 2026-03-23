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
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." },
      { id: 300, name: "The Chill Ella", lat: 6.874, lng: 81.045, img: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Best view in Ella.", scam: "Drivers might say it's 'closed' to take you elsewhere." }
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
      { id: 600, name: "Dewmini Roti Shop", lat: 5.948, lng: 80.471, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f", desc: "Legendary Banoffee Roti.", scam: "Totally safe. Fixed prices on menu." }
    ]
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

  private updateMarkers() {
    if (!this.view) return;
    this.view.graphics.removeAll();

    // Ripristina i pin salvati nel viaggio
    this.selectedLocations().forEach(loc => this.view.graphics.add(loc.graphic));

    // Aggiunge i nuovi pin della categoria
    const data = this.currentItems();
    data.forEach((item: any) => {
      const point = new Point({ longitude: item.lng, latitude: item.lat });

      // Goccia bianca con bordo colorato
      const pin = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          path: "M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z",
          color: "blue",
          outline: { color: item.color, width: 2 },
          size: "46px",
          yoffset: "23px"
        } as any
      });

      // Foto dentro la goccia
      const photo = new Graphic({
        geometry: point,
        symbol: {
          type: "picture-marker",
          url: item.img,
          width: "32px", height: "32px", yoffset: "29px"
        } as any,
        attributes: { ...item, IsStatic: true }
      });

      this.view.graphics.addMany([pin, photo]);
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