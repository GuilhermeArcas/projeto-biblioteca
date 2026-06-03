import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import loanRoutes from '../src/routes/loanRoutes'; 
import bookRoutes from '../src/routes/bookRoutes';
import sequelize from '../src/config/database';
import User from '../src/models/User';
import {describe, it, before} from 'mocha';

describe('Teste dos Endpoints de Empréstimos (Loans)', () => {
    let app: express.Application;
    let livroId: number;
    let usuarioId: number;
    let usuarioId2: number; 
    let emprestimoId: number; // <-- Armazena o ID do empréstimo para testar a devolução

    before(async () => {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        app = express();
        app.use(express.json());
        app.use(bookRoutes);
        app.use(loanRoutes); 

        // 1. Cadastra o livro de teste (Estoque: 1)
        const livro = await request(app)
            .post('/books')
            .send({
                title: "O Codificador Limpo",
                author: "Robert C. Martin",
                isbn: "9788550807447",
                totalQuantity: 1
            });
        livroId = livro.body.id;

        // 2. Primeiro Usuário
        const novoUsuario = await User.create({
            name: "Guilherme Arcas",
            email: "guilherme@email.com",
            password_hash: "hash_de_teste_123",
            role: "cliente"
        });
        usuarioId = (novoUsuario as any).id;

        // 3. Segundo Usuário
        const novoUsuario2 = await User.create({
            name: "Outro Usuário",
            email: "outro@email.com",
            password_hash: "hash_de_teste_456",
            role: "cliente"
        });
        usuarioId2 = (novoUsuario2 as any).id;
    });

    it('Deve ser capaz de realizar um empréstimo com sucesso se houver estoque', async () => {
        const response = await request(app)
            .post('/loans')
            .send({
                book_id: livroId,
                user_id: usuarioId, 
                user_name: "Guilherme Arcas",
                loan_date: new Date()
            });

        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property('id');
        
        emprestimoId = response.body.id; // <-- Salva o ID para usar nos testes abaixo!
    });

    it('Não deve permitir emprestar um livro que está esgotado', async () => {
        const response = await request(app)
            .post('/loans')
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
        // Envia a requisição para a rota de devolução
        // (Ajuste o payload e a rota se o seu controller esperar algo diferente, ex: { id: emprestimoId })
        const response = await request(app)
            .post('/loans/return')
            .send({
                loan_id: emprestimoId 
            });

        expect(response.status).to.be.oneOf([200, 204]);
    });

    it('Não deve permitir devolver um empréstimo que já foi devolvido', async () => {
        // Tenta devolver o MESMO ID de empréstimo pela segunda vez
        const response = await request(app)
            .post('/loans/return')
            .send({
                loan_id: emprestimoId
            });

        // O seu controller deve barrar (400 Bad Request ou 422 Unprocessable Entity)
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.have.property('error');
    });
});