import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

export class AuthController {
    static async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, senha } = req.body; 

            // validação básica de entrada
            if (!email || !senha) {
                return res.status(400).json({ error: 'E-mail e senha obrigatórios. '});
            }

            // busca o usuário no banco pelo e-mail
            const user = await User.findOne({ where: { email } });

            if (!user) {
                // mensagem genérica por segurança para evitar dar pistas se o e-mail existe
                return res.status(401).json({error: 'E-mail ou senha inválidos.'});
            }

            // compara senha digitada com o hash do banco de dados
            // O bycript pega a senha pura, joga no mesmo algoritmo e vê se o resultado bate com a password_hash
            const senhaValida = await bcrypt.compare(senha, (user as any).password_hash);

            if (!senhaValida) {
                return res.status(401).json({ error: 'E-mail ou senha inválida'});
            }

            // se a senha for válida, usa a chave secreta do .env
            const secret = process.env.JWT_SECRET || 'fallback_secret';

            // Geramos o token JWT 
            // Passamos o id e a role dentro do "payload" para sabermos quem é o usuário nas próximas rotas
            const token = jwt.sign(
                { id: (user as any).id, role: (user as any).role },
                secret,
                { expiresIn: '1d'} // o token expira automaticamente em 1 dia
            );

            // retorna o token para o cliente, junto com alguns dados básicos do usuário
            return res.json({
                token,
                user: {
                    id: (user as any).id, 
                    name: (user as any).name,
                    email: (user as any).email,
                    role: (user as any).role
                }
            });

        } catch (error) {
            console.error('Erro no processo de login: ',error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}