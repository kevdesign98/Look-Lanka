import { Component, inject } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, RouterLink],
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.css'
})
export class ItineraryComponent {
  authService = inject(AuthService);

  async logout() {
    await this.authService.logout();
  }
}
