import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn = signal(false)
  public authService = inject(AuthService);

  router = inject(Router);

  // Stato per il dropdown del profilo
  isProfileDropdownOpen = signal(false);
  // Stato per il menu mobile (che già avevi)

  // ... i tuoi navLinks() computed ...

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(val => !val);
  }

  async logout() {
    await this.authService.logout();
    this.isProfileDropdownOpen.set(false);
    this.router.navigate(['/home']);
  }
  // Signal per gestire il menu mobile
  isMobileMenuOpen = signal(false);

  private allLinks = [
    { path: '/home', label: 'Home', protected: false },
    { path: '/explore', label: 'Explore', protected: false },
    { path: '/safety', label: 'Safety', protected: false },
    { path: '/my-trip', label: 'My Trip', protected: true },
    { path: '/events', label: 'Events', protected: false }
  ];

  // Generiamo la lista filtrata in base al login
  navLinks = computed(() => {
    const user = this.authService.currentUser();
    return this.allLinks.filter(link => !link.protected || (link.protected && user));
  });

  toggleMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }
}