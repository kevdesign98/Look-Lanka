import { Component, OnInit, signal, inject } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private dataService = inject(DataService)

  weatherData = signal<any>(null);
  currencyData = signal<any>(null);


  ngOnInit(): void {
    this.dataService.getHomeData().subscribe({
      next: (res: any) => {
        this.weatherData.set(res.weather);
        this.currencyData.set(res.currency.rates['LKR']);
      },
      error: (err) => console.error('Error to get data from API', err)
    })
  }

  // Aggiungi un metodo nel tuo HomeComponent
  searchCity(city: string) {
    if (!city) return;

    this.dataService.getWeather(city).subscribe({
      next: (res: any) => {
        this.weatherData.set(res);
      },
      error: (err) => {
        console.error('Città non trovata', err);
        // Opzionale: potresti mostrare un messaggio di errore all'utente
      }
    });
  }

  constructor() {

  }


}
