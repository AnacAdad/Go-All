import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import type { Restaurant } from '../types';
import { getRestaurants } from '../services/restaurantService';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const position: [number, number] = [-5.0892, -42.8016]; // Teresina

// O mapa agora recebe quais filtros estão ligados
interface MapProps {
  activeFilters: string[];
}

export function Map({ activeFilters }: MapProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const loadRestaurants = async () => {
      const data = await getRestaurants();
      setRestaurants(data);
    };
    loadRestaurants();
  }, []); // Carrega do banco de dados apenas 1 vez ao abrir a tela

  // Aqui acontece a mágica do filtro!
  // Se não tem filtro clicado, mostra todos. Se tem, filtra a lista.
  const filteredRestaurants = activeFilters.length === 0 
    ? restaurants 
    : restaurants.filter(rest => {
        // Verifica se o restaurante possui TODAS as tags que o usuário selecionou
        return activeFilters.every(filter => rest.verifiedFeatures.includes(filter));
      });

  return (
    <div className="w-full relative">
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={true} 
          style={{ height: '500px', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Agora nós mapeamos e desenhamos apenas a lista FILTRADA */}
          {filteredRestaurants.map((rest) => (
            <Marker 
              key={rest.id} 
              position={[rest.location.latitude, rest.location.longitude]}
            >
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <strong className="text-base text-gray-800">{rest.name}</strong>
                  <p className="text-xs text-gray-500 mt-1">{rest.address}</p>
                  <div className="mt-3 text-gray-600 flex flex-col gap-1">
                    {rest.verifiedFeatures.map(feature => (
                      <span key={feature} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium border border-indigo-100">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}