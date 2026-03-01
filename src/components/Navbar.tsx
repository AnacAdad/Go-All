import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import logoImg from '../assets/logo2.png'; // 1. Importamos a imagem da logo

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Bloco do Logo e Título */}
        <div className="flex items-center gap-2">
          {/* 2. O Link agora engloba a imagem e o texto */}
          <Link to="/" className="flex items-center gap-3 hover:text-indigo-400 transition-colors">
            
            {/* 3. A Imagem da Logo */}
            <img 
              src={logoImg} 
              alt="Logo Go All" 
              className="w-10 h-10 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
            />
            
            {/* 4. O Nome Go All aumentado (mudei de text-2xl para text-3xl) */}
            <span className="text-3xl font-serif font-bold text-slate-100 tracking-wider">
              Go All
            </span>
          </Link>
        </div>

        <div className="hidden md:flex gap-8 items-center font-medium text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-100 transition-colors duration-300">
            Explorar Mapa
          </Link>
          <Link to="/sobre" className="hover:text-slate-100 transition-colors duration-300">
            Sobre o Projeto
          </Link>
          <Link to="/novo" className="hover:text-slate-100 transition-colors duration-300 text-indigo-400 font-semibold">
            + Cadastrar Local
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-300">
                Olá, <strong className="text-indigo-400">{user.email?.split('@')[0]}</strong>
              </span>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors duration-300 cursor-pointer"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-indigo-600/90 hover:bg-indigo-500 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              Entrar
            </Link>
          )}
        </div>

        <button className="md:hidden text-slate-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

      </div>
    </nav>
  );
}