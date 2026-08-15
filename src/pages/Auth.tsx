import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  // Estados para capturar o que o usuário digita
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hook do React Router para redirecionar o usuário após o login
  const navigate = useNavigate();

  // Função que é disparada ao clicar no botão Entrar/Cadastrar
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (isLogin) {
        // Fluxo de Login
        await signInWithEmailAndPassword(auth, email, password);

        navigate('/');
      } else {
        // Fluxo de Cadastro
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Salva o nome do usuário no perfil do Firebase Authentication
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });

        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error);

      // Tradução simples de alguns erros comuns do Firebase
      if (error.code === 'auth/invalid-credential') {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Esse e-mail já está cadastrado.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Digite um e-mail válido.');
      } else {
        setErrorMsg('Ocorreu um erro. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.15)] p-8 border border-slate-700">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-100 tracking-wide mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>

          <p className="text-slate-400 text-sm">
            {isLogin
              ? 'Entre para avaliar e descobrir novos lugares.'
              : 'Junte-se à comunidade por uma cidade mais acessível.'}
          </p>
        </div>

        {/* Mostra mensagem de erro em vermelho se algo der errado */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleAuth}>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nome completo
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Como prefere ser chamado?"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.4)] mt-4 cursor-pointer"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setName('');
            }}
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors cursor-pointer"
          >
            {isLogin
              ? 'Ainda não tem uma conta? Crie agora.'
              : 'Já tem uma conta? Faça login.'}
          </button>
        </div>

      </div>
    </div>
  );
}