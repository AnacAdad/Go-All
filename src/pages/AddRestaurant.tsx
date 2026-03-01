import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
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

export function AddRestaurant() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adiciona ou remove a tag selecionada
  const toggleFeature = (tag: string) => {
    if (selectedFeatures.includes(tag)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== tag));
    } else {
      setSelectedFeatures([...selectedFeatures, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Consultar a API gratuita do OpenStreetMap para achar a coordenada real do endereço
      // Dica: Adicionamos "Teresina, PI" na busca para garantir que ele ache na sua cidade
      const searchQuery = encodeURIComponent(`${address}, Teresina, Piauí, Brasil`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`);
      const geocodeData = await response.json();

      let finalLat = -5.0892; // Coordenada padrão (Centro) caso a API não ache a rua
      let finalLng = -42.8016;

      // Se a API encontrou o endereço, usamos as coordenadas exatas!
      if (geocodeData && geocodeData.length > 0) {
        finalLat = parseFloat(geocodeData[0].lat);
        finalLng = parseFloat(geocodeData[0].lon);
      } else {
        alert("Não encontramos o local exato no mapa, então ele foi colocado no centro da cidade. Tente colocar o endereço mais completo depois!");
      }

      // 2. Salvar no Firebase com a coordenada real
      await addDoc(collection(db, 'restaurants'), {
        name,
        address,
        location: new GeoPoint(finalLat, finalLng),
        verifiedFeatures: selectedFeatures,
        averageRating: 5
      });

      // 3. Voltar para a tela inicial
      navigate('/');
    } catch (error) {
      console.error("Erro ao salvar restaurante:", error);
      alert("Ops! Ocorreu um erro ao salvar.");
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
              Ajude a comunidade adicionando um restaurante e suas opções de acessibilidade.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Restaurante</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Ex: Pizzaria Forno de Ouro"
              />
            </div>

            {/* Campo Endereço */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Ex: Av. Nossa Sra. de Fátima, 1234 - Fátima"
              />
            </div>

            {/* Botões de Acessibilidade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                O que este local possui? <span className="text-slate-400 font-normal">(Selecione todos que se aplicam)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {accessibilityTags.map(tag => {
                  const isActive = selectedFeatures.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleFeature(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isActive ? `✓ ${tag}` : tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão de Salvar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg mt-4 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? 'Salvando...' : 'Publicar Local'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}