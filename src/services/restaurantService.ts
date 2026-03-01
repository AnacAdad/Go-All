import { collection, getDocs, addDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import type { Restaurant } from '../types';

// Referência para a coleção "restaurants" no banco de dados
const restaurantsRef = collection(db, 'restaurants');

// 1. Função para BUSCAR todos os restaurantes
export async function getRestaurants(): Promise<Restaurant[]> {
  const snapshot = await getDocs(restaurantsRef);
  
  const restaurantsList = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      address: data.address,
      location: data.location,
      verifiedFeatures: data.verifiedFeatures || [],
      averageRating: data.averageRating || 0,
    } as Restaurant;
  });

  return restaurantsList;
}

// 2. Função rápida para ADICIONAR um restaurante de teste em Teresina
export async function addTestRestaurant() {
  await addDoc(restaurantsRef, {
    name: "Café Acessível",
    address: "Av. Frei Serafim, Centro, Teresina - PI",
    // Usando GeoPoint do Firebase para as coordenadas (perto do centro)
    location: new GeoPoint(-5.0850, -42.8050),
    verifiedFeatures: ['Rampa de acesso', 'Banheiro adaptado', 'Mesa acessível'],
    averageRating: 5
  });
  console.log("Restaurante de teste adicionado com sucesso!");
}