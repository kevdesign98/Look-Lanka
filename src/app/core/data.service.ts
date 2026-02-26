import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private http = inject(HttpClient);

  private weatherKey = 'f0a2824d138645732007cf496c9b53b9';

  getHomeData() {
    const weather = this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=Colombo&appid=${this.weatherKey}&units=metric&lang=it`);
    const currency = this.http.get('https://open.er-api.com/v6/latest/EUR');
    return forkJoin({ weather, currency })
  }
  getWeather(city: string) {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherKey}&units=metric&lang=it`);
  }
}
