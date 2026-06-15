import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Busca o token que a tela de Login salvou lá atrás
    const token = localStorage.getItem('@Biblioteca:token');
    
    // Se o token existir (não for nulo), muda o estado para true
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Função auxiliar para quando o usuário quiser deslogar
  function handleLogout() {
    localStorage.removeItem('@Biblioteca:token'); // Apaga o token do navegador
    setIsAuthenticated(false); // Derruba a autenticação da tela
  }

  // Se NÃO estiver autenticado, renderiza a tela de login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Se passar pelo IF acima, significa que está autenticado! 
  // Então renderizamos a Dashboard e passamos uma barra de topo com o botão Sair
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-xl text-emerald-400">📚 DevLibrary</span>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Sair do Sistema
        </button>
      </nav>

      {/* Tela principal que criamos juntos */}
      <Dashboard />
    </div>
  );
}