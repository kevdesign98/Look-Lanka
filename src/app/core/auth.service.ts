import { inject, Injectable, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' }) // Questo lo rende disponibile in tutta l'app
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Il Signal che la tua Navbar sta cercando disperatamente!
  currentUser = signal<User | null>(null);

  constructor() {
    // Ogni volta che Firebase dice "l'utente è cambiato", noi aggiorniamo il Signal
    user(this.auth).subscribe(u => {
      this.currentUser.set(u);
    });
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.router.navigate(['/']);
      return result.user;
    } catch (error) {
      console.error("Errore Google Auth:", error);
      return null;
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/signin']);
  }
}