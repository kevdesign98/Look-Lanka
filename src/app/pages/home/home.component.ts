import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { DataService } from '../../core/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    FormsModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private dataService = inject(DataService);

  weatherData = signal<any>(null);
  currencyData = signal<any>(null);

  ngOnInit(): void {
    this.dataService.getHomeData().subscribe({
      next: (res: any) => {
        this.weatherData.set(res.weather);
        this.currencyData.set(res.currency.rates['LKR']);
      },
      error: (err) => console.error('Error fetching home data', err),
    });
  }

  searchCity(city: string): void {
    if (!city?.trim()) return;
    this.dataService.getWeather(city.trim()).subscribe({
      next: (res: any) => this.weatherData.set(res),
      error: (err) => console.error('City not found:', err),
    });
  }
}