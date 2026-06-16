import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/authMiddleware';
import Loan from '../models/Loan';
import Book from '../models/Book';
import User from '../models/User';
import { error } from 'node:console';

class LoanController {
    public async create(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { book_id } = req.body;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: 'Usuário não autenticado pelo token'})
            }

            // validar se o usuário existe
           const userExists = await User.findByPk(user_id);
                if (!userExists) {
                return res.status(404).json({error: 'Usuário não encontrado'});
            }

            // validar se o livro existe
            const book = await Book.findByPk(book_id);
            if (!book) {
                return res.status(404).json({ error: 'Livro não encontrado'});
            }

            // REGRA DE NEGÓCIO: Verificar se há estoque disponível do livro
            if (book.availableQuantity <= 0) {
                return res.status(404).json({ error: 'Este livro não está disponível no momento! (estoque esgotado)'});
            }

            // Se passou nas validações, criamos o registro de empréstimo
            const loan = await Loan.create({ user_id, book_id});

            // Atualização de estoque: Diminuimos 1 da quantidade disponível do livro
            book.availableQuantity -= 1;
            await book.save(); // salva as alterações no banco

            return res.status(201).json(loan);
            } catch (error: any) {
                // Alteramos esta linha para enviar a mensagem real do erro na resposta HTTP
                return res.status(500).json({ 
                    error: 'Erro interno ao realizar empréstimo',
                    details: error.message || error 
                });
            }
        }

        public async listMyLoans(req: CustomRequest, res: Response): Promise<Response> {
            try {
                const user_id = req.user?.id 

                // busca todos os empréstimos onde o user_id seja igual ao do token
                const loans = await Loan.findAll({
                    where: { user_id },
                    include: [{ model: Book, as: 'book' }]
                });

                return res.status(200).json(loans);
            } catch (error: any) {
                return res.status(500).json({
                    error: 'Erro interno ao listar empréstimo',
                    details: error.message
                });
            }
        }

        public async returnBook(req: Request, res: Response): Promise<Response> {
            try{
                const { loan_id } = req.body;

                // busca o empréstimo pelo id e inclue os dados do livro junto
                const loan = await Loan.findByPk(loan_id, { include: ['book'] });

                if (!loan) {
                    return res.status(404).json({ error: 'Empréstimo não encontrado! '});
                }

                // Regra de negócio: verificar se o livro já não foi devolvido antes
                if (loan.status === 'returned') {
                    return res.status(400).json({ error: "Este empréstimo já foi encerrado (livro já devolvido) "});
                }

                // Atualiza dados do empréstimo
                loan.return_date = new Date(); // Grava o momento em que o livro foi devolvido
                loan.status = 'returned'; // atualiza o status do empréstimo 
                await loan.save();

                // Atualiza o estoque do livro: Incrementa 1 na quantidade disponível
                // Como usamos o "include: ['book'] acima, o Sequelize dá acesso direto ao livro"
                const book = await Book.findByPk(loan.book_id);
                if (book) {
                    book.availableQuantity += 1;
                    await book.save();
                }

                return res.status(200).json({
                    message: 'Livro devolvido com sucesso!',
                    loan
                });
            } catch (error: any) {
                return res.status(500).json({
                    error: 'Erro interno ao devolver o livro',
                    details: error.message || error
                });
            }
        }
    }

    export default new LoanController();
