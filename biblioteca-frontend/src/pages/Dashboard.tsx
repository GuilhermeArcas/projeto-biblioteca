import { useEffect, useState } from "react";
import api from "../services/api";

interface Livro {
    id: number;
    title: string;
    author: string;
}


export function DashBoard() {
    const [livros, setLivros] = useState<Livro[]>([]);

    // Aqui dentro que é feita a ligação para o backend (os colchetes no final 
    // garantem que essa ligação seja feita apenas uma vez, quando a página é iniciada)
    useEffect(() =>{
    api.get('/books').then((resposta) => {
        setLivros(resposta.data)
    });
    }, []);

    {livros.map((livro) =>{
        return (
            <div key={livro.id} className="bg-slate-800 p-4 rounded">
                <h2>{livro.title}</h2>
                <p>{livro.author}</p>
            </div>
        );
    })}
}

