import { Component, Input, inject } from '@angular/core';
import { StatusService } from '../../core/status.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statuscheck',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statuscheck.component.html',
  styleUrl: './statuscheck.component.css'
})
export class StatuscheckComponent {
  @Input() mode: 'compact' | 'full' = 'full';
  status = inject(StatusService);

  weatherData = this.status.weather();
  rateData = this.status.exchangeRate();
  alertData = this.status.safetyAlert();
}
