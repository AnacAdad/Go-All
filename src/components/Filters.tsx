const accessibilityTags = [
  'Rampa de acesso',
  'Banheiro adaptado',
  'Cardápio em Braille',
  'Piso tátil',
  'Libras',
  'Mesa acessível',
  'Estacionamento'
];

// O componente agora recebe propriedades (props) da página Home
interface FiltersProps {
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
}

export function Filters({ activeFilters, setActiveFilters }: FiltersProps) {
  
  const toggleFilter = (tag: string) => {
    if (activeFilters.includes(tag)) {
      setActiveFilters(activeFilters.filter(f => f !== tag));
    } else {
      setActiveFilters([...activeFilters, tag]);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
        Filtrar por Acessibilidade
      </h2>
      <div className="flex flex-wrap gap-2">
        {accessibilityTags.map(tag => {
          const isActive = activeFilters.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleFilter(tag)}
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
  );
}