import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

import { auth, db } from '../config/firebaseConfig';
import { Navbar } from '../components/Navbar';
import type { Place } from '../types';

export function Favorites() {
  const [user, setUser] = useState<User | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          setPlaces([]);
          return;
        }

        const favorites: string[] =
          userSnapshot.data().favorites || [];

        const favoritePlaces = await Promise.all(
          favorites.map(async (placeId) => {
            const placeRef = doc(db, 'places', placeId);
            const placeSnapshot = await getDoc(placeRef);

            if (!placeSnapshot.exists()) {
              return null;
            }

            return {
              id: placeSnapshot.id,
              ...placeSnapshot.data()
            } as Place;
          })
        );

        setPlaces(
          favoritePlaces.filter(
            (place): place is Place => place !== null
          )
        );
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-2">
          Meus Favoritos
        </h1>

        <p className="text-slate-400 mb-8">
          Locais que você salvou para consultar depois.
        </p>

        {loading ? (
          <p className="text-slate-400">
            Carregando favoritos...
          </p>
        ) : places.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-slate-300 mb-4">
              Você ainda não favoritou nenhum local.
            </p>

            <Link
              to="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-colors"
            >
              Explorar mapa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {places.map((place) => (
              <div
                key={place.id}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
              >
                <span className="inline-block bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs mb-3">
                  {place.category || 'Local'}
                </span>

                <h2 className="text-xl font-bold mb-2">
                  {place.name}
                </h2>

                <p className="text-slate-400 text-sm mb-4">
                  📍 {place.address}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {place.verifiedFeatures?.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full"
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/local/${place.id}`}
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}