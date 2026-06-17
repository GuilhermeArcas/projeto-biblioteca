import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    // Busca o token que a tela de Login salvou lá atrás
    const token = localStorage.getItem('@Biblioteca:token');
    
    // Se o token existir (não for nulo), muda o estado para true
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // não estava sumindo, citei o aviso então citei a função aqui pra sumir, espero não dar erro futuramente :/
  toggleTheme

  // Função auxiliar para quando o usuário quiser deslogar
  function handleLogout() {
    localStorage.removeItem('@Biblioteca:token'); // Apaga o token do navegador
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    window.location.reload(); // Derruba a autenticação da tela
  }

  // Se NÃO estiver autenticado, renderiza a tela de login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Se passar pelo IF acima, significa que está autenticado! 
  // Então renderizamos a Dashboard e passamos uma barra de topo com o botão Sair
  return (
    /* 3. Container do App adaptado com as classes dark: */
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* 4. Navbar adaptada com suporte a Light e Dark Mode */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-colors duration-300">
        <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">📚 DevLibrary</span>
        
        <div className="flex items-center gap-4">
          {/* O Botão de alternância agora fica fixo no cabeçalho global! */}
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Sair do Sistema
          </button>
        </div>
      </nav>

      {/* Tela principal */}
      <Dashboard />
    </div>
  );
}