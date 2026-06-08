import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import bcrypt from 'bcryptjs'; // <-- MUDADO PARA BCRYPTJS PARA CASAR COM O SEU MODELO
import loanRoutes from '../src/routes/loanRoutes'; 
import bookRoutes from '../src/routes/bookRoutes';
import authRoutes from '../src/routes/authRoutes'; 
import sequelize from '../src/config/database';
import User from '../src/models/User'; 
import { describe, before, it } from 'mocha';

describe('Teste dos Endpoints de Empréstimos (Loans) com JWT', () => {
    let app: express.Application;
    let livroId: number;
    let usuarioId: number;
    let usuarioId2: number; 
    let emprestimoId: number;
    let tokenUsuario1: string = '';
    let tokenUsuario2: string = '';

    before(async () => {
        try {
            process.env.JWT_SECRET = 'minha_chave_secreta_super_segura_e_longa_123!'; 

            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
            await sequelize.sync({ force: true });
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

            app = express();
            app.use(express.json());
            app.use(bookRoutes);
            app.use(loanRoutes); 
            app.use(authRoutes);

            // 1. Cadastra o livro
            const livro = await request(app)
                .post('/books')
                .send({
                    title: "O Codificador Limpo",
                    author: "Robert C. Martin",
                    isbn: "9788550807447",
                    totalQuantity: 1
                });
            livroId = livro.body.id;

            // 2. Criação dos Usuários enviando a senha pura (Deixando o hook beforeSave agir)
            const user1 = await User.create({
                name: "Guilherme Arcas",
                email: "guilherme@email.com",
                password_hash: "123456", 
                role: "cliente"
            } as any);
            usuarioId = (user1 as any).id;

            const user2 = await User.create({
                name: "Outro Usuário",
                email: "outro@email.com",
                password_hash: "123456", 
                role: "cliente"
            } as any);
            usuarioId2 = (user2 as any).id;

            // 3. Login oficial para capturar tokens
            const login1 = await request(app)
                .post('/auth/login')
                .send({ email: "guilherme@email.com", senha: "123456" });
            tokenUsuario1 = login1.body.token;

            const login2 = await request(app)
                .post('/auth/login')
                .send({ email: "outro@email.com", senha: "123456" });
            tokenUsuario2 = login2.body.token;

        } catch (err) {
            // Se houver qualquer erro no setup do banco ou criptografia, este bloco pega
            console.error("❌ ERRO CRÍTICO DENTRO DO BEFORE DO TESTE:", err);
        }
    });

    it('Deve ser capaz de realizar um empréstimo com sucesso se houver estoque', async () => {
        const response = await request(app)
            .post('/loans')
            .set('Authorization', `Bearer ${tokenUsuario1}`)
            .send({
                book_id: livroId,
                user_id: usuarioId, 
                user_name: "Guilherme Arcas",
                loan_date: new Date()
            });

        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property('id');
        
        emprestimoId = response.body.id;
    });

    it('Não deve permitir emprestar um livro que está esgotado', async () => {
        const response = await request(app)
            .post('/loans')
            .set('Authorization', `Bearer ${tokenUsuario2}`)
            .send({
                book_id: livroId,
                user_id: usuarioId2, 
                user_name: "Outro Usuário",
                loan_date: new Date()
            });

        expect(response.status).to.equal(404); 
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('estoque'); 
    });

    it('Deve ser capaz de devolver um livro com sucesso', async () => {
        const response = await request(app)
            .post('/loans/return')
            .set('Authorization', `Bearer ${tokenUsuario1}`)
            .send({
                loan_id: emprestimoId 
            });

        expect(response.status).to.be.oneOf([200, 204]);
    });

    it('Não deve permitir devolver um empréstimo que já foi devolvido', async () => {
        const response = await request(app)
            .post('/loans/return')
            .set('Authorization', `Bearer ${tokenUsuario1}`)
            .send({
                loan_id: emprestimoId
            });

        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.have.property('error');
    });
});