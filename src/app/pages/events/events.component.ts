import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  // Lista eventi principali
  events = signal([
    {
      title: 'Kandy Esala Perahera',
      date: 'August',
      tag: 'Culture & Religion',
      location: 'Kandy',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Perahara2.jpg',
      description: 'The most iconic festival in Sri Lanka with parades of elephants, fire dancers and traditional costumes.'
    },
    {
      title: 'Sinhala & Tamil New Year (Aluth Avurudu)',
      date: 'April',
      tag: 'Culture & Religion',
      location: 'All Island',
      image: 'https://images.unsplash.com/photo-1561827978-45f07fa822fe?q=80&w=1084&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'It is one of the most important cultural celebrations in Sri Lanka. It marks the end of the old year and the beginning of the new one, based on the sun\'s passage from the house of Pisces to that of Aries.'
    },
    {
      title: 'Vesak',
      date: 'May',
      tag: 'Spiritual',
      location: 'All Island',
      image: 'https://images.unsplash.com/photo-1717216229791-0d437312799a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'It is the most important Buddhist festival, celebrated during the full moon in May to commemorate the birth, enlightenment (Nirvana) and death (Parinirvana) of the Buddha.'
    },
    {
      title: 'Season of Sri Pada',
      date: 'December - May',
      tag: 'Spiritual',
      location: 'Sri Pada',
      image: 'https://images.unsplash.com/photo-1653151106766-52f14da3bb68?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Pilgrimage to the sacred mountain, one of the most important religious sites in Sri Lanka.'
    }
  ]);
}
