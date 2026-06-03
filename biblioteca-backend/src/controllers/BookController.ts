import { Request, Response } from 'express';
import Book from '../models/Book';

class BookController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { title, author, isbn, totalQuantity } = req.body;

      if (!title || !author || !isbn) {
        return res.status(400).json({ error: 'Título, autor e ISBN são obrigatórios.' });
      }

      const newBook = await Book.create({
        title,
        author,
        isbn,
        totalQuantity: totalQuantity || 1,
        availableQuantity: totalQuantity || 1,
      });

      return res.status(201).json(newBook);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Já existe um livro cadastrado com este ISBN.' });
      }
      return res.status(500).json({ error: 'Erro interno ao cadastrar o livro.' });
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const books = await Book.findAll();
      return res.status(200).json(books);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar os livros.' });
    }
  }
}

export default new BookController();