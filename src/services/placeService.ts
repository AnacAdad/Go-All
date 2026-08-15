import { collection, getDocs, addDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { Place } from '../types';

const placesRef = collection(db, 'places');

// 1. Função para BUSCAR todos os lugares
export async function getPlaces(): Promise<Place[]> {
  const snapshot = await getDocs(placesRef);
  
  const placesList = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      address: data.address,
      location: data.location,
      verifiedFeatures: data.verifiedFeatures || [],
      averageRating: data.averageRating || 0,
      category: data.category || undefined,
    } as Place;
  });

  return placesList;
}

