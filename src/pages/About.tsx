import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 flex flex-col gap-8 items-center text-center mt-8">
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
          Sobre o AcessaFood
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 text-lg text-slate-600 leading-relaxed space-y-6">
          <p>
            Sair de casa para comer não deveria ser sinônimo de ansiedade ou frustração. O <strong>Go All</strong> nasceu com um propósito claro: garantir que pessoas com deficiência possam verificar a infraestrutura dos restaurantes da cidade antes mesmo de sair de casa.
          </p>
          <p>
            Acreditamos que a informação é a melhor ferramenta para a inclusão. Por isso, construímos uma plataforma 100% colaborativa, onde a própria comunidade avalia, valida e compartilha quais locais realmente oferecem rampas de acesso, banheiros adaptados, cardápios em Braille e muito mais.
          </p>
          <p>
            Mais do que um mapa, somos uma rede de apoio para tornar Teresina e todas as cidades lugares que acolhem a todos, sem exceção.
          </p>
        </div>

        <Link 
          to="/" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-indigo-200"
        >
          Voltar para o Mapa
        </Link>

      </main>
    </div>
  );
}