import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import type { Place } from '../types';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  osm_type?: string;
  osm_id?: number;
}

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [goAllResults, setGoAllResults] = useState<Place[]>([]);
  const [externalResults, setExternalResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const term = searchTerm.trim();

    if (!term) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // ==============================
      // 1. BUSCA NOS LOCAIS DO GOALL
      // ==============================
      const placesSnapshot = await getDocs(
        collection(db, 'places')
      );

      const places = placesSnapshot.docs.map((placeDoc) => ({
        id: placeDoc.id,
        ...placeDoc.data()
      })) as Place[];

      const normalizedTerm = term.toLowerCase();

      const filteredGoAllPlaces = places.filter((place) => {
        return (
          place.name
            ?.toLowerCase()
            .includes(normalizedTerm) ||
          place.address
            ?.toLowerCase()
            .includes(normalizedTerm) ||
          (place.category || '')
            .toLowerCase()
            .includes(normalizedTerm)
        );
      });

      setGoAllResults(filteredGoAllPlaces);

      // ==============================
      // 2. BUSCA NO OPENSTREETMAP
      // ==============================
      const params = new URLSearchParams({
        q: term,
        format: 'jsonv2',
        addressdetails: '1',
        countrycodes: 'br',
        limit: '5',
        'accept-language': 'pt-BR'
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar no OpenStreetMap');
      }

      const nominatimData: NominatimResult[] =
        await response.json();

      // Evita mostrar como externo um local
      // que já está cadastrado no GoAll.
      const externalOnly = nominatimData.filter((result) => {
        const resultText = result.display_name.toLowerCase();

        return !filteredGoAllPlaces.some((place) =>
          resultText.includes(place.name.toLowerCase())
        );
      });

      setExternalResults(externalOnly);

    } catch (error) {
      console.error('Erro na busca:', error);

      alert(
        'Não foi possível realizar a busca. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔎
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Busque um local, endereço ou categoria..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {hasSearched && !loading && (
        <div className="mt-6 space-y-6">

          {/* =========================
              RESULTADOS DO GOALL
          ========================= */}
          {goAllResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                Locais cadastrados no GoAll
              </h2>

              <div className="space-y-3">
                {goAllResults.map((place) => (
                  <div
                    key={place.id}
                    className="bg-slate-800 border border-indigo-500/30 rounded-2xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-400 text-sm font-semibold">
                            ✓ GoAll
                          </span>

                          {place.category && (
                            <span className="text-xs text-indigo-400">
                              {place.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-100">
                          {place.name}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          📍 {place.address}
                        </p>
                      </div>

                      <Link
                        to={`/local/${place.id}`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium text-center transition-colors"
                      >
                        Ver detalhes
                      </Link>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================
              RESULTADOS EXTERNOS
          ========================= */}
          {externalResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                Outros locais encontrados
              </h2>

              <div className="space-y-3">
                {externalResults.map((result) => (
                  <div
                    key={result.place_id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-4"
                  >
                    <p className="text-xs text-amber-400 font-semibold mb-1">
                      Ainda não cadastrado no GoAll
                    </p>

                    <h3 className="text-lg font-bold text-slate-100">
                      {result.name ||
                        result.display_name.split(',')[0]}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      📍 {result.display_name}
                    </p>

                    <p className="text-sm text-slate-500 mt-3">
                      Este local ainda não possui informações
                      de acessibilidade cadastradas no GoAll.
                    </p>
                    <Link
  to={`/novo?name=${encodeURIComponent(
    result.name || result.display_name.split(',')[0]
  )}&address=${encodeURIComponent(
    result.display_name
  )}&lat=${encodeURIComponent(
    result.lat
  )}&lon=${encodeURIComponent(
    result.lon
  )}&osm_type=${encodeURIComponent(
    result.osm_type || ''
  )}&osm_id=${encodeURIComponent(
    result.osm_id?.toString() || ''
  )}`}
  className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
>
  + Adicionar informações de acessibilidade
</Link>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Resultados externos: © OpenStreetMap contributors
              </p>
            </div>
          )}

          {goAllResults.length === 0 &&
            externalResults.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
                <p className="text-slate-400">
                  Nenhum local encontrado.
                </p>
              </div>
            )}

        </div>
      )}
    </div>
  );
}