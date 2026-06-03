import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { error } from 'node:console';

// Criamos uma interface para estender o comportamento do Request do express
// Isso nos permite "injetar" os dados do usuário autenticado dentro da requisição
// tornando esses dados acessíveis em qualquer Controller que venha depois.

export interface CustomRequest extends Request {
    user?: {
        id: number,
        role: string;
    };
}

export class AuthMiddleware {
    static async handle(req: CustomRequest, res: Response, next: NextFunction) {
        // Pega o cabeçalho de autorização da requisição
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
        }

        // Vamos dividir a string pelo espaço para separar a palabra 'Bearer' do token real
        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ error: 'Erro no formato do token '});
        }

        const [scheme, token] = parts;

        // Verifica se a palavra 'Bearer' está correta
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ error: 'Token mal formatado '});
        }

        // Validação do token real usando a chave do .env
        const secret = process.env.JWT_SECRET || 'fallback_secret';

        try {
            // a função jwt.verify descriptografa e checa a assinatura do token
            // Se o token estiver expirado ou modificado, ela joga um erro direto para o catch
            const decoded = jwt.verify(token, secret) as { id: number; role: string };

            // injeta os dados criptografados do usuário dentro do 'req.user'
            // qualquer controller adiante saberá quem fez a requisição
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            // diz ao express que está tudo certo e ele pode passar para o próximo bloco
            return next();

        } catch (error) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });

        }
    }
}