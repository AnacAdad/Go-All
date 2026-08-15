import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  collection,
  addDoc,
  doc,
  getDocs,
  setDoc,
  GeoPoint,
  serverTimestamp
} from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';
import { Navbar } from '../components/Navbar';

const accessibilityTags = [
  'Rampa de acesso',
  'Banheiro adaptado',
  'Cardápio em Braille',
  'Piso tátil',
  'Libras',
  'Mesa acessível',
  'Estacionamento'
];

export function AddPlace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Se veio da busca híbrida, nome e endereço já vêm preenchidos
  const [name, setName] = useState(
    searchParams.get('name') || ''
  );

  const [address, setAddress] = useState(
    searchParams.get('address') || ''
  );

  const [category, setCategory] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adiciona ou remove uma característica de acessibilidade
  const toggleFeature = (tag: string) => {
    if (selectedFeatures.includes(tag)) {
      setSelectedFeatures(
        selectedFeatures.filter((feature) => feature !== tag)
      );
    } else {
      setSelectedFeatures([
        ...selectedFeatures,
        tag
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        alert(
          'Você precisa estar logado para adicionar um local.'
        );
        return;
      }

      // =======================================
      // COORDENADAS DA BUSCA HÍBRIDA
      // =======================================

      const latFromUrl = searchParams.get('lat');
      const lonFromUrl = searchParams.get('lon');

      // IMPORTANTE:
      // mesmos nomes enviados pelo SearchBar
      let osmType = searchParams.get('osmType');
      let osmId = searchParams.get('osmId');

      let finalLat: number;
      let finalLng: number;

      if (latFromUrl && lonFromUrl) {
        // O local veio da busca híbrida
        finalLat = parseFloat(latFromUrl);
        finalLng = parseFloat(lonFromUrl);

        if (
          Number.isNaN(finalLat) ||
          Number.isNaN(finalLng)
        ) {
          alert(
            'As coordenadas deste local são inválidas.'
          );
          return;
        }

      } else {
        // =======================================
        // CADASTRO MANUAL
        // =======================================

        const searchQuery = encodeURIComponent(
          `${address}, Brasil`
        );

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`
        );

        if (!response.ok) {
          throw new Error(
            'Erro ao consultar o OpenStreetMap.'
          );
        }

        const geocodeData = await response.json();

        if (
          geocodeData &&
          geocodeData.length > 0
        ) {
          finalLat = parseFloat(
            geocodeData[0].lat
          );

          finalLng = parseFloat(
            geocodeData[0].lon
          );

          // Se o resultado possuir dados do OSM,
          // guardamos para prevenção de duplicidade.
          osmType =
            geocodeData[0].osm_type || null;

          osmId =
            geocodeData[0].osm_id
              ? String(geocodeData[0].osm_id)
              : null;

        } else {
          alert(
            'Não encontramos esse endereço no mapa. Tente informar um endereço mais completo.'
          );

          return;
        }
      }

      // =======================================
      // VERIFICAR DUPLICIDADE
      // =======================================

      const placesSnapshot = await getDocs(
        collection(db, 'places')
      );

      const normalizedName = name
        .trim()
        .toLowerCase();

      const existingPlace =
        placesSnapshot.docs.find(
          (placeDoc) => {
            const data = placeDoc.data();

            // 1. Verificação pelo identificador
            // do OpenStreetMap
            const sameOsm =
              Boolean(osmType) &&
              Boolean(osmId) &&
              data.osmType === osmType &&
              String(data.osmId) ===
                String(osmId);

            // 2. Verificação pelo nome
            const sameName =
              (data.name || '')
                .trim()
                .toLowerCase() ===
              normalizedName;

            // 3. Verificação pelas coordenadas
            const location = data.location;

            const sameCoordinates =
              location &&
              Math.abs(
                location.latitude -
                  finalLat
              ) < 0.0001 &&
              Math.abs(
                location.longitude -
                  finalLng
              ) < 0.0001;

            return (
              sameOsm ||
              (
                sameName &&
                sameCoordinates
              )
            );
          }
        );

      if (existingPlace) {
        alert(
          'Este local já está cadastrado no GoAll.'
        );

        navigate(
          `/local/${existingPlace.id}`
        );

        return;
      }

      // =======================================
      // PREPARAR DADOS DO NOVO LOCAL
      // =======================================

      const placeData = {
        name: name.trim(),
        address: address.trim(),
        category,

        location: new GeoPoint(
          finalLat,
          finalLng
        ),

        verifiedFeatures:
          selectedFeatures,

        averageRating: 0,

        createdBy: user.uid,

        createdAt: serverTimestamp(),

        // Só adiciona esses campos caso existam
        ...(osmType &&
          osmId && {
            osmType,
            osmId,
            osmKey: `${osmType}_${osmId}`
          })
      };

      // =======================================
      // SALVAR NO FIRESTORE
      // =======================================

      if (osmType && osmId) {
        // Se temos identificação do OpenStreetMap,
        // usamos um ID previsível no Firestore
        const placeRef = doc(
          db,
          'places',
          `osm_${osmType}_${osmId}`
        );

        await setDoc(
          placeRef,
          placeData
        );

      } else {
        // Se o Nominatim não retornou osmType/osmId,
        // o cadastro continua funcionando normalmente
        await addDoc(
          collection(db, 'places'),
          placeData
        );
      }

      alert(
        'Local cadastrado com sucesso!'
      );

      navigate('/');

    } catch (error) {
      console.error(
        'Erro ao salvar local:',
        error
      );

      alert(
        'Ops! Ocorreu um erro ao salvar.'
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">

          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Cadastrar Novo Local
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Ajude a comunidade adicionando um local e suas informações de acessibilidade.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Local
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Ex: Shopping Rio Poty"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria do Local
              </label>

              <select
                required
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">
                  Selecione uma categoria
                </option>

                <option value="Restaurante">Restaurante</option>

                <option value="Bar">
                  Bar
                </option>

                <option value="Cafeteria">
                  Cafeteria
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Loja">
                  Loja
                </option>

                <option value="Supermercado">
                  Supermercado
                </option>

                <option value="Hospital">
                  Hospital
                </option>

                <option value="Clínica">
                  Clínica
                </option>

                <option value="Farmácia">
                  Farmácia
                </option>

                <option value="Escola">
                  Escola
                </option>

                <option value="Faculdade">
                  Faculdade
                </option>

                <option value="Hotel">
                  Hotel
                </option>

                <option value="Praça">
                  Praça
                </option>

                <option value="Cinema">
                  Cinema
                </option>

                <option value="Academia">
                  Academia
                </option>

                <option value="Órgão Público">
                  Órgão Público
                </option>

                <option value="Outro">
                  Outro
                </option>
              </select>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço Completo
              </label>

              <input
                type="text"
                required
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Ex: Av. Nossa Sra. de Fátima, 1234 - Fátima"
              />
            </div>

            {/* Recursos de acessibilidade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">

                O que este local possui?{' '}

                <span className="text-slate-400 font-normal">
                  (Selecione todos que se aplicam)
                </span>

              </label>

              <div className="flex flex-wrap gap-2">

                {accessibilityTags.map(
                  (tag) => {

                    const isActive =
                      selectedFeatures.includes(
                        tag
                      );

                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() =>
                          toggleFeature(tag)
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isActive
                          ? `✓ ${tag}`
                          : tag}
                      </button>
                    );
                  }
                )}

              </div>
            </div>

            {/* Publicar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg mt-4 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting
                ? 'Salvando...'
                : 'Publicar Local'}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
}