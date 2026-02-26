import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './safety.component.html',
  styleUrl: './safety.component.css'
})
export class SafetyComponent {

  scams = signal([{
    title: 'The "Closed" Attraction',
    severity: 'High',
    location: 'Anuradhapura, Polonnaruwa, Colombo',
    description: 'Your driver or a random local claims the temple/museum is closed for a local festival. They offer to take you to a "better" place, usually a high-commission gem shop.',
    prevention: 'Always go to the entrance yourself to check. Use official opening hours from LookLanka.'
  },
  {
    title: 'The Stilt Fishermen Fee',
    severity: 'Medium',
    location: 'Weligama, Ahangama',
    description: 'The iconic fishermen on stilts are often actors. If you take a photo, "managers" will appear demanding 1000-5000 LKR.',
    prevention: 'Agree on a price before taking photos, or look for authentic fishermen at sunrise away from the main road.'
  }
  ]);

}
