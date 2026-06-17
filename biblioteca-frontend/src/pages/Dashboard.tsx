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

    // Estado do tema (Tenta ler do localStorage, senão assume 'dark')
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    });

    // Função para buscar livros no backend
    async function fetchBooks() {
        try {
            setIsLoading(true);
            const response = await api.get('/books');
            setLivros(response.data);
        } catch (error) {
            console.error("Erro ao buscar livros:", error);
            alert("Não foi possível carregar o catálogo de livros.");
        } finally {
            setIsLoading(false);
        }
    }

    // Função para buscar os empréstimos no backend
    async function fetchLoans() {
        try {
            setIsLoading(true);
            const response = await api.get('/loans'); 
            setLoans(response.data);
        } catch (error) {
            console.error("Erro ao buscar empréstimos:", error);
            alert("Não foi possível carregar o seu histórico.");
        } finally {
            setIsLoading(false);
        }
    }
   
    // 1. Carrega os livros apenas uma vez na inicialização
    useEffect(() => {
        fetchBooks(); 
    }, []);

    // 2. Escuta a mudança de abas para buscar os empréstimos
    useEffect(() => {
        if (activeTab === 'loans') {
            fetchLoans();
        }
    }, [activeTab]);

    // O BLOCO DUPLICADO DA CHAMADA FOI REMOVIDO DAQUI!

    // UseEffect para aplicar a classe dark/light no elemento HTML global
    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    // Função para alterar o tema 
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // FUNÇÃO DE SOLICITAR EMPRÉSTIMO
    async function handleSolicitarEmprestimo(bookId: number) {
        try {
            await api.post('/loans', { book_id: bookId });
            alert('Empréstimo realizado com sucesso!');

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

    // FUNÇÃO DE DEVOLVER LIVRO
    async function handleDevolverLivro(loanId: number) {
        try {
            const response = await api.post('/loans/return', { loan_id: loanId });
            alert('Livro devolvido com sucesso! 📚✨');

            const loanAtualizado = response.data.loan; 
            const bookIdDevolvido = loanAtualizado ? loanAtualizado.book_id : null;

            setLoans(loansAntigos =>
                loansAntigos.map(loan =>
                    loan.id === loanId
                    ? { ...loan, status: 'returned', return_date: new Date().toISOString() }
                    : loan
                )
            );

            if (bookIdDevolvido) {
                setLivros(livrosAntigos =>
                    livrosAntigos.map(livro =>
                        livro.id === bookIdDevolvido
                        ? { ...livro, totalQuantity: livro.totalQuantity + 1 }
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
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* CABEÇALHO COM O BOTÃO DE ALTERNÂNCIA */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📚 Biblioteca Digital</h1>
                    
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer"
                    >
                        {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
                    </button>
                </div>
                
                {/* 1. Menu de Abas (Tabs) */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 gap-4">
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors ${
                            activeTab === 'books'
                            ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        📖 Livros Disponíveis
                    </button>
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`pb-4 px-2 font-medium border-b-2 text-sm transition-colors ${
                            activeTab === 'loans'
                            ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        🗓️ Meus Empréstimos
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">A carregar dados da biblioteca...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'books' ? (
                            livros.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                    <p className="text-slate-500 dark:text-slate-400">Nenhum livro disponível no catálogo de momento. 📚</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {livros.map(livro => (
                                        <div key={livro.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm dark:shadow-none">
                                            <div>
                                                <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-1">{livro.title}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Autor: {livro.author}</p>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                    Qtd disponível: {livro.totalQuantity}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleSolicitarEmprestimo(livro.id)}
                                                disabled={livro.totalQuantity === 0}
                                                className={`mt-4 w-full font-semibold py-2 px-4 rounded-lg transition-colors text-sm cursor-pointer ${
                                                    livro.totalQuantity === 0 
                                                    ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed' 
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
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-none">
                                {loans.length === 0 ? (
                                    <p className="p-6 text-slate-500 dark:text-slate-400 text-center">Ainda não realizou nenhum empréstimo. 🗓️</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold">
                                                    <th className="p-4">Livro</th>
                                                    <th className="p-4">Data do Empréstimo</th>
                                                    <th className="p-4">Data de Devolução</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-center">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                                                {loans.map((loan) => (
                                                    <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-4 font-medium text-slate-900 dark:text-white">
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
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                : loan.status === 'delayed'
                                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
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
                                                                <span className="text-xs text-slate-400 dark:text-slate-500 italic">Encerrado</span>
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
        </div>
    );
}