import { Request, Response } from 'express';
import User from '../models/User';

class UserController {
  // Rota para cadastrar um novo usuário (POST)
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password_hash, role } = req.body;

      // Validação básica dos dados obrigatórios
      if (!name || !email || !password_hash) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
      }

      // Cria o usuário no banco de dados
      // Lembra que o hook 'beforeSave' no modelo User vai transformar "senha123" em um hash seguro!
      const newUser = await User.create({
        name,
        email,
        password_hash, // Passamos o texto limpo, o Sequelize se encarrega de mascarar
        role: role || 'client',
      });

      // Por segurança, não devolvemos o hash da senha na resposta HTTP
      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };

      return res.status(201).json(userResponse);
    } catch (error: any) {
      // Trata o erro caso o e-mail já esteja cadastrado (campo unique no banco)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
      return res.status(500).json({ error: 'Erro interno ao cadastrar o usuário.' });
    }
  }
}

export default new UserController();