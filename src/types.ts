import { GeoPoint } from 'firebase/firestore';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  verifiedFeatures: string[];
  averageRating: number;
}