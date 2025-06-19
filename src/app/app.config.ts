import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "spotify-clone-reguvel07", appId: "1:904992940290:web:f401ab9b7b95f98745e21b", storageBucket: "spotify-clone-reguvel07.firebasestorage.app", apiKey: "AIzaSyDUirPMfK7EC9fOHcg9Ol7PxsqR9WcQ04Y", authDomain: "spotify-clone-reguvel07.firebaseapp.com", messagingSenderId: "904992940290", measurementId: "G-4NBK4NLT9N" })), provideFirestore(() => getFirestore())]
};
