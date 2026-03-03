import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private firestore: Firestore) { }

  async saveItinerary(stops: any[]) {
    const tripsCollection = collection(this.firestore, 'trips');
    return addDoc(tripsCollection, {
      stops: stops,
      createdAt: serverTimestamp(),
      title: "Nuovo Viaggio Sri Lanka"
    });
  }

  async getTrips() {
    const tripsCollection = collection(this.firestore, 'trips');
    // Ordiniamo per data di creazione decrescente (il più recente in alto)
    const q = query(tripsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}