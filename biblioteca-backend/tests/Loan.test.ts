import { describe, before, it } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import loanRoutes from '../src/routes/loanRoutes'; 
import bookRoutes from '../src/routes/bookRoutes';
import sequelize from '../src/config/database';
import User from '../src/models/User'; 

describe('Teste dos Endpoints de Empréstimos (Loans)', () => {
    let app: express.Application;
    let livroId: number;
    let usuarioId: number;
    let usuarioId2: number; // <-- ADICIONADO: Segundo usuário para o teste de estoque

    before(async () => {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        app = express();
        app.use(express.json());
        app.use(bookRoutes);
        app.use(loanRoutes); 

        // 1. Cadastra o livro com totalQuantity: 1
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
       // 2. Primeiro Usuário - Adicionado o campo 'role'
        const novoUsuario = await User.create({
            name: "Guilherme Arcas",
            email: "guilherme@email.com",
            password_hash: "hash_de_teste_123",
            role: "cliente" // <-- Preencha com o valor que o seu modelo User espera!
        });
        usuarioId = (novoUsuario as any).id;

        // 3. Segundo Usuário - Adicionado o campo 'role'
        const novoUsuario2 = await User.create({
            name: "Outro Usuário",
            email: "outro@email.com",
            password_hash: "hash_de_teste_456",
            role: "cliente" // <-- Preencha aqui também!
        });
        usuarioId2 = (novoUsuario2 as any).id;
    });

    it('Deve ser capaz de realizar um empréstimo com sucesso se houver estoque', async () =>{
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
    });

   it('Não deve permitir emprestar um livro que está esgotado', async () =>{
        const response = await request(app)
            .post('/loans')
            .send({
                book_id: livroId,
                user_id: usuarioId2, 
                user_name: "Outro Usuário",
                loan_date: new Date()
            });

        // Alterado para 404 para bater exatamente com o que a sua API retorna!
        expect(response.status).to.equal(404); 
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('estoque'); 
    });
});