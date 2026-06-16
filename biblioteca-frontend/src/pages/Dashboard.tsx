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
    status: 'pending' | 'returned';
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

    // fUNÇÃO PARA BUSCAR OS EMPRÉSTIMOS NO BACKEND
    async function fetchLoans() {
        try {
            const response = await api.get('/loans');
            setLoans(response.data);
        } catch (error) {   
            console.error("Erro ao buscar empréstimos:", error);
            alert("Não foi possível carregar o seu histórico.");
        }
    }     

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
        // faz a chamada POST para a rota da devolução enviando o ID do empréstimo
        await api.post('/loans/return', { loan_id: loanId});

        alert('Livro devolvido com sucesso!');

        // Atualização de estado inteligente: 
        // Mapeia os empréstimos atuais. Quando encontra o empréstimo que foi devolvido,
        // muda o status dele para 'returned' e injeta a data de hoje como returned_date
        setLoans(loansAntigos => 
          loansAntigos.map(loan => 
            loan.id === loanId
              ? { ...loan, status: 'returned', return_date: new Date().toISOString() }
              : loan
          )
        );

      } catch (error: any) {
        const mensagem = error.response?.data?.error || "Não foi possível devolver o livro.";
        alert(mensagem);
      }
    }

    
     return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    
    {/* 1. Menu de Abas (Tabs) */}
    <div className="flex border-b border-slate-700 mb-8 gap-4">
      <button
        onClick={() => setActiveTab('books')}
        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors ${
          activeTab === 'books'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        📖 Livros Disponíveis
      </button>
      <button
        onClick={() => setActiveTab('loans')}
        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors ${
          activeTab === 'loans'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        🗓️ Meus Empréstimos
      </button>
    </div>

    {/* 2. Renderização Condicional */}
    {activeTab === 'books' ? (
      // --- ABA DE LIVROS (O seu código antigo dos cards entra exatamente aqui) ---
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
              className={`mt-4 w-full font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${
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
    ) : (
      // --- ABA DE EMPRÉSTIMOS (A nova tabela estilizada) ---
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loans.length === 0 ? (
          <p className="p-6 text-slate-400 text-center">Você ainda não realizou nenhum empréstimo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-300 border-b border-slate-700 text-sm font-semibold">
                  <th className="p-4">Livro</th>
                  <th className="p-4">Data do Empréstimo</th>
                  <th className="p-4">Data de Devolução</th>
                  <th className="p-4">Status</th>
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
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {loan.status === 'returned' ? 'Devolvido' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>
);
}

