import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  authService = inject(AuthService);
  deferredPrompt = signal<any>(null);

  selectedCurrency = signal<string>('EUR');
  amount = signal<number>(0);

  // Lista valute supportate
  currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  exchangeRates: Record<string, number> = {
    'LKR': 1,      // Base
    'EUR': 0.0031, // 1 LKR = 0.0031 EUR
    'USD': 0.0034, // 1 LKR = 0.0034 USD
    'GBP': 0.0026  // 1 LKR = 0.0026 GBP
  };

  // Ascolta l'evento di installazione del browser (PWA)
  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt.set(e);
  }

  installPWA() {
    const prompt = this.deferredPrompt();
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('App installata!');
        }
        this.deferredPrompt.set(null);
      });
    } else {
      alert("L'app è già installata o il browser non supporta l'installazione rapida.");
    }
  }

  updateCurrency(code: string) {
    this.selectedCurrency.set(code);
    // Qui potresti aggiungere la chiamata a Firebase per salvare la scelta
    localStorage.setItem('preferred_currency', code);
    console.log('Valuta aggiornata a:', code);
  }

  convertedAmount = computed(() => {
    const rate = this.exchangeRates[this.selectedCurrency()];
    return (this.amount() * rate).toFixed(2);
  });

  onAmountChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.amount.set(Number(val));
  }
}