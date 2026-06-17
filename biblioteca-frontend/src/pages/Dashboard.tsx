import { useEffect, useState } from "react";
import api from "../services/api";

interface Livro {
    id: number;
    title: string;
    author: string;
    totalQuantity: number;
}

interface Loan {
    id: number;
    book_id: number;
    user_id: number;
    status: 'active' | 'returned' | 'delayed';
    loan_date: string;
    return_date: string | null;
    book: {
        title: string;
        author: string;
    };
}

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books');
    const [loans, setLoans] = useState<Loan[]>([]);
    const [livros, setLivros] = useState<Livro[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    async function fetchBooks() {
      try {
        setIsLoading(true); // 1. Ativa o círculo de carregamento
        const response = await api.get('/books');
        setLivros(response.data); // Atualiza os livros na tela
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        alert("Não foi possível carregar o catálogo de livros.");
      } finally {
        setIsLoading(false); // 2. Desativa o carregamento (sucesso ou erro)
      }
    }

    // fUNÇÃO PARA BUSCAR OS EMPRÉSTIMOS NO BACKEND
    async function fetchLoans() {
      try {
        setIsLoading(true); // Ativa o carregamento ao mudar de aba
        const response = await api.get('/loans'); 
        setLoans(response.data);
      } catch (error) {
        console.error("Erro ao buscar empréstimos:", error);
        alert("Não foi possível carregar o seu histórico.");
      } finally {
        setIsLoading(false); // Desativa o carregamento
      }
    }
   
    useEffect(() => {
      fetchBooks(); 
    }, []);

    useEffect(() => {
        if (activeTab === 'loans') {
            fetchLoans();
        }
    }, [activeTab]);

    // Aqui dentro que é feita a ligação para o backend (os colchetes no final 
    // garantem que essa ligação seja feita apenas uma vez, quando a página é iniciada)
    useEffect(() => {
        api.get('/books').then((resposta) => {
            setLivros(resposta.data);
        });
    }, []);


    // FUNÇÃO DE SOLICITAR EMPRÉSTIMO
    async function handleSolicitarEmprestimo(bookId: number) {
        try {
            // Faz a chamada POST enviando o ID do livro no corpo
            await api.post('/loans', { book_id: bookId });

            alert('Empréstimo realizado com sucesso!');

            // Atualização inteligente do Estado, sem precisar recarregar a página
            // Varre a lista atual de livros, quando se acha o livro que foi emprestado
            // diminui a quantidade em 1
            setLivros(livrosAntigos => 
                livrosAntigos.map(livro =>
                    livro.id === bookId
                    ? { ...livro, totalQuantity: livro.totalQuantity - 1 }
                    : livro
                )
            );
        } catch (error: any) {
            const mensagem = error.response?.data?.error || "Não foi possível solicitar o empréstimo.";
            alert(mensagem);
        }
    }

    async function handleDevolverLivro(loanId: number) {
      try {
        // 1. Faz a chamada para o backend devolver o livro
        const response = await api.post('/loans/return', { loan_id: loanId });

        alert('Livro devolvido com sucesso! 📚✨');

        // Pegamos os dados do empréstimo atualizado que o seu backend já retorna no json
        const loanAtualizado = response.data.loan; 
        const bookIdDevolvido = loanAtualizado ? loanAtualizado.book_id : null;

        // REATIVIDADE 1: Atualiza a tabela de Empréstimos (Você já tem isso)
        setLoans(loansAntigos =>
          loansAntigos.map(loan =>
            loan.id === loanId
              ? { ...loan, status: 'returned', return_date: new Date().toISOString() }
              : loan
          )
        );

        // REATIVIDADE 2: Atualiza o estoque na aba de Livros Disponíveis (A Mágica acontece aqui!)
        // Procuramos o livro pelo ID no seu estado de livros e somamos +1 na quantidade disponível
        if (bookIdDevolvido) {
          setLivros(livrosAntigos =>
            livrosAntigos.map(livro =>
              livro.id === bookIdDevolvido
                ? { ...livro, totalQuantity: livro.totalQuantity + 1 } // ou availableQuantity, dependendo do nome no seu front
                : livro
            )
          );
        }

      } catch (error: any) {
        const mensagem = error.response?.data?.error || 'Não foi possível devolver o livro.';
        alert(mensagem);
      }
    }

    
  return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    
    {/* 1. Menu de Abas (Tabs) - Mantém igual */}
    <div className="flex border-b border-slate-700 mb-8 gap-4">
      <button
        onClick={() => setActiveTab('books')}
        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors hover: cursor-pointer ${
          activeTab === 'books'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        📖 Livros Disponíveis
      </button>
      <button
        onClick={() => setActiveTab('loans')}
        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors hover: cursor-pointer ${
          activeTab === 'loans'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        🗓️ Meus Empréstimos
      </button>
    </div>

    {/* 2. NOVA CONDICIONAL: SE ESTIVER CARREGANDO, MOSTRA O SPINNER */}
    {isLoading ? (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        {/* Spinner animado com Tailwind */}
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">A carregar dados da biblioteca...</p>
      </div>
    ) : (
      /* SE NÃO ESTIVER CARREGANDO, RENDERIZA AS ABAS NORMALMENTE */
      <>
        {activeTab === 'books' ? (
          // --- ABA DE LIVROS ---
          livros.length === 0 ? (
            /* Tratamento para lista de livros vazia */
            <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 p-6">
              <p className="text-slate-400">Nenhum livro disponível no catálogo de momento. 📚</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {livros.map(livro => (
                <div key={livro.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-400 mb-1">{livro.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">Autor: {livro.author}</p>
                    <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">
                      Qtd disponível: {livro.totalQuantity}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleSolicitarEmprestimo(livro.id)}
                    disabled={livro.totalQuantity === 0}
                    className={`mt-4 w-full font-semibold py-2 px-4 rounded-lg transition-colors text-sm hover: cursor-pointer ${
                      livro.totalQuantity === 0 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {livro.totalQuantity === 0 ? 'Indisponível' : 'Solicitar Empréstimo'}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          // --- ABA DE EMPRÉSTIMOS ---
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {loans.length === 0 ? (
              <p className="p-6 text-slate-400 text-center">Ainda não realizou nenhum empréstimo. 🗓️</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-300 border-b border-slate-700 text-sm font-semibold">
                      <th className="p-4">Livro</th>
                      <th className="p-4">Data do Empréstimo</th>
                      <th className="p-4">Data de Devolução</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-sm text-slate-300">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-medium text-white">
                          {loan.book?.title || 'Livro Removido'}
                        </td>
                        <td className="p-4">
                          {new Date(loan.loan_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          {loan.return_date 
                            ? new Date(loan.return_date).toLocaleDateString('pt-BR') 
                            : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            loan.status === 'returned'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : loan.status === 'delayed'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {loan.status === 'returned' && 'Devolvido'}
                            {loan.status === 'delayed' && 'Atrasado'}
                            {loan.status === 'active' && 'Ativo'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {loan.status === 'active' || loan.status === 'delayed' ? (
                            <button
                              onClick={() => handleDevolverLivro(loan.id)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-1 px-3 rounded-md transition-colors text-xs cursor-pointer"
                            >
                              Devolver
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Encerrado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);
}

