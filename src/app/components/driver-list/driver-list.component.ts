import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.css'
})
export class DriverListComponent {
  drivers = [
    {
      name: 'Sudath Perera',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudath',
      vehicle: 'Luxury Hybrid Sedan',
      languages: ['English', 'Sinhala'],
      rating: 4.9,
      reviews: 124,
      whatsapp: '+94712345678',
      badges: ['SLTDA Licensed', 'Fixed Rates']
    },
    {
      name: 'Ruwan Kumara',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruwan',
      vehicle: 'Comfortable Mini Van (7 seats)',
      languages: ['English', 'German', 'Sinhala'],
      rating: 4.8,
      reviews: 89,
      whatsapp: '+94777654321',
      badges: ['Expert Guide', 'No Shopping Stops']
    }
  ];
}
