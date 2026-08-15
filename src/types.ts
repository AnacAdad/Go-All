import { GeoPoint, Timestamp } from 'firebase/firestore';

export interface Place {
  id: string;
  name: string;
  address: string;
  category: string; 
  location: GeoPoint;
  verifiedFeatures: string[];
  averageRating: number;
  createdBy?: string;
  createdAt?: Timestamp;
}