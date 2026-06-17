import { useState } from "react";
import api from "../services/api";

export function Login() {
    // Variáveis para guardar e-mail e senha
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // Função para quando o usuário clicar no botão enviar
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault(); // Evita que a página recarregue e perca os dados
    
        try {
            // Faz o POST real para o AuthController 
            const response = await api.post('/auth/login', { email, senha });

            // Captura o token e os dados do usuário enviados pelo backend
            const { token } = response.data;

            // Guarda o token de forma segura no navegador
            localStorage.setItem('@Biblioteca:token', token);

            alert('Login feito com sucesso! Recarregue a página.');
            window.location.reload(); // Recarrega para o App.tsx ler o novo token

            } catch (error) {
                alert('E-mail ou senha incorretos! Verifique os dados.');
        }
    }

    // Visual da tela de login
    // 3. O visual da tela de login com Tailwind v4
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-400">📚 DevLibrary Login</h2>
        
        <div className="mb-4">
          <label className="block text-sm mb-2">E-mail</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Atualiza a variável email
            className="w-full bg-slate-900 border border-slate-600 p-3 rounded text-white focus:border-emerald-500 outline-none"
            placeholder="seuemail@email.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2">Senha</label>
          <input 
            type="password" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)} // Atualiza a variável senha
            className="w-full bg-slate-900 border border-slate-600 p-3 rounded text-white focus:border-emerald-500 outline-none"
            placeholder="******"
            required
          />
        </div>

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3 rounded transition-colors hover: cursor-pointer">
          Entrar no Sistema
        </button>
      </form>
    </div>
  );
}