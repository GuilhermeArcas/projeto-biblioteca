import { useEffect, useState } from "react";
import api from "../services/api";

interface Livro {
    id: number;
    title: string;
    author: string;
    totalQuantity: number;
}

export function Dashboard() {
    const [livros, setLivros] = useState<Livro[]>([]);
    // Aqui dentro que é feita a ligação para o backend (os colchetes no final 
    // garantem que essa ligação seja feita apenas uma vez, quando a página é iniciada)
    useEffect(() => {
        api.get('/books').then((resposta) => {
            setLivros(resposta.data);
        });
    }, []);

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

    

     return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            {/* Topo da Página */}
            <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3x1 font-bold text-emerald-400">DevLibrary</h1>
                    <p className="text-slate-400 text-sm mt-1">Livros disponíveis para empréstimo</p>
                </div>
            </header>

            {/* Grid onde os cards vão se organizar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                     {livros.map((livro) => (
                    <div key={livro.id} className="bg-slate-800 p-6 rounded-x1 border border-slate-700 shadow-lg hover:border-emerald-500/50 transition-all">
                        <div className="text-2xl mb-2">📚</div>
                        <h2 className="text-xl font-bold text-slate-100">{livro.title}</h2>
                        <p className="text-slate-400 text-sm mt-1">Autor: {livro.author}</p>

                        {/* Botão decorativo temporário */}
                        <button 
                            onClick={() => handleSolicitarEmprestimo(livro.id)}
                            disabled={livro.totalQuantity === 0}
                            className={`mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 px-4 rounded-lg transition-colors text-sm
                                ${livro.totalQuantity === 0
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                }`}
                        >
                            {livro.totalQuantity === 0 ? 'Indisponível' : 'Solicitar Empréstimo'}   
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

