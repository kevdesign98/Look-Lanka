import { Component, OnInit, ViewChild, ElementRef, NgZone, OnDestroy } from '@angular/core';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";

import { CommonModule } from '@angular/common';

// @Component({
//     selector: 'app-mapscanvas',
//     standalone: true, // Se è standalone
//     // templateUrl:[''],
//     styleUrls: [],
//     imports: [CommonModule]
// })
// export class MapscanvasComponent implements OnInit, OnDestroy {
//     @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
//     private view!: MapView;

//     constructor(private zone: NgZone) { }

//     ngOnInit() {
//         // 1. Allineiamo la versione degli asset alla 5.0.4 che hai installato
//         esriConfig.assetsPath = "https://js.arcgis.com/5.0/@arcgis/core/assets";

//         this.zone.runOutsideAngular(() => {
//             // 2. Usiamo una basemap che ESISTE sicuramente (scelta dalla tua lista log)
//             const map = new Map({
//                 basemap: "topo-vector"
//             });

//             this.view = new MapView({
//                 container: this.mapViewEl.nativeElement,
//                 map: map,
//                 center: [80.7718, 7.8731],
//                 zoom: 7,
//                 resizeAlign: "center",
//                 // 3. TRUCCO FONDAMENTALE: Svuotiamo la UI all'inizio per evitare l'errore appendChild
//                 ui: { components: [] as any }
//             });

//             this.view.when(() => {
//                 console.log("Mappa caricata con successo!");

//                 // 4. Una volta che la mappa è caricata (quindi il div ESISTE nel DOM),
//                 // riaggiungiamo i componenti UI uno alla volta in modo sicuro
//                 this.zone.run(() => {
//                     this.view.ui.add("zoom", "top-left");
//                     this.view.ui.add("attribution", "bottom-right");
//                 });
//             }).catch((err: any) => {
//                 console.error("Errore nel caricamento della mappa:", err);
//             });
//         });
//     }

//     ngOnDestroy() {
//         if (this.view) {
//             this.view.destroy();
//         }
//     }
// }