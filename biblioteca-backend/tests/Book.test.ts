import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import bookRoutes from '../src/routes/bookRoutes';
import sequelize from '../src/config/database';

// Mini aplicação Express isolada para o ambiente de teste
const app = express();
app.use(express.json());
app.use(bookRoutes);

describe('📚 Testes dos Endpoints de Livros', () => {

  // Limpa e sincroniza o banco de dados uma vez antes de rodar os testes
  before(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

    await sequelize.sync({ force: true });
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
  });

  it('Deve ser capaz de cadastrar um novo livro com sucesso', async () => {
    const response = await request(app)
      .post('/books')
      .send({
        title: "Arquitetura Limpa",
        author: "Robert C. Martin",
        isbn: "9788550804606",
        totalQuantity: 2
      });

    // Validações do Mocha/Chai
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.title).to.equal("Arquitetura Limpa");
  });

  it('Não deve permitir cadastrar um livro sem título', async () => {
    const response = await request(app)
      .post('/books')
      .send({
        author: "Robert C. Martin",
        isbn: "1234567890"
      });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });
});