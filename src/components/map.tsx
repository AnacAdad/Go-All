import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {Link} from 'react-router-dom';

import type { Place } from '../types';
import { getPlaces } from '../services/placeService';

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
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const loadPlaces = async () => {
      const data = await getPlaces();
      setPlaces(data);
    };
    loadPlaces();
  }, []); // Carrega do banco de dados apenas 1 vez ao abrir a tela

  // Se não tem filtro clicado, mostra todos. Se tem, filtra a lista.
  const filteredPlaces = places.filter((place) => {
  return (
    activeFilters.length === 0 ||
    activeFilters.every((filter) =>
      place.verifiedFeatures.includes(filter)
    )
  );
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
          
          {/* Agora mapeamos e desenhamos apenas a lista FILTRADA */}
          {filteredPlaces.map((place) => (
            <Marker 
              key={place.id} 
              position={[
                place.location.latitude, 
                place.location.longitude]}
            >
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <strong className="text-base text-gray-800">{place.name}</strong>
                  {place.category && (<p className="text-xs font-medium text-indigo-600 mt-1">{place.category}</p>)}
                  <p className="text-xs text-gray-500 mt-1">{place.address}</p>
                  <div className="mt-3 text-gray-600 flex flex-col gap-1">
                    {place.verifiedFeatures.map(feature => (
                      <span key={feature} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium border border-indigo-100">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/local/${place.id}`}
                    className="block mt-3 bg-indigo-600 hover:bg-indigo-500 text-white text-center px-3 py-2 rounded-lg font-medium transition-colors"
                 >
                   Ver detalhes
                 </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}