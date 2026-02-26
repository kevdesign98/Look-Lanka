import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service'; // Assicurati che il percorso sia giusto
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  // Inietta il servizio separato
  private authService = inject(AuthService);

  loginConGoogle() {
    this.authService.signInWithGoogle();
  }
}
