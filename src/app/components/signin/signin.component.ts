import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  private authService = inject(AuthService);

  signInWithGoogle() {
    this.authService.signInWithGoogle();
  }
}
