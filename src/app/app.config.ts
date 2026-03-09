import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environments';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideServiceWorker } from '@angular/service-worker';

const firebaseConfig = {
  apiKey: "AIzaSyCd6vJmH3GtEAi4u_Csi3OFDSPbRf0VtiQ",
  authDomain: "looklanka-beb0b.firebaseapp.com",
  projectId: "looklanka-beb0b",
  storageBucket: "looklanka-beb0b.firebasestorage.app",
  messagingSenderId: "80093877143",
  appId: "1:80093877143:web:66693def6ab00af2cb6ad2",
  measurementId: "G-FFZRFLYN54"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideHttpClient(), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};