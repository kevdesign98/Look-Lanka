import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Look-Lanka';
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Lenis deve girare solo nel browser (importante se usi SSR)
    if (isPlatformBrowser(this.platformId)) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: any) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Funzione di easing fluida
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2, // Rende lo scroll touch ancora più burroso
        infinite: false,
      });

      // Il "cuore" di Lenis: il ciclo di animazione
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }
  }
}