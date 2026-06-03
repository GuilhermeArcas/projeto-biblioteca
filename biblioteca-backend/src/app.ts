import express, { Request, Response } from 'express';
import sequelize from './config/database';

// 1. Importa todos os arquivos de rotas
import bookRoutes from './routes/bookRoutes';
import userRoutes from './routes/userRoutes'; // <-- Adicionado
import loanRoutes from './routes/loanRoutes'; // <-- Adicionado

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. Registra todas as rotas no Express
app.use(bookRoutes);
app.use(userRoutes); // <-- Adicionado
app.use(loanRoutes); // <-- Adicionado

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API da Biblioteca Digital rodando e conectada!' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o MariaDB estabelecida com sucesso.');

    // O sync vai ler os modelos importados pelas rotas e criar as tabelas no banco
    await sequelize.sync({ force: true });
    console.log('📚 Tabelas sincronizadas com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar ou sincronizar o banco de dados:', error);
  }
}

startServer();