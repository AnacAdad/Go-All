import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Map } from '../components/map';
import { Filters } from '../components/Filters';
import { SearchBar } from '../components/SearchBar';

export function Home() {
  // Estado para guardar quais filtros a pessoa clicou
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">

        <header className="mb-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Lugares que acolhem.
          </h1>

          <p className="text-slate-600 text-lg mt-2 max-w-2xl">
            Encontre e avalie a acessibilidade de locais da cidade.
            Uma rede construída por e para pessoas com deficiência.
          </p>
        </header>

        {/* Busca híbrida: GoAll + OpenStreetMap */}
        <SearchBar />

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

          <Filters
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />

          <Map
            activeFilters={activeFilters}
          />

        </section>

      </main>
    </div>
  );
}