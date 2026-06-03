import request from 'supertest';
import { expect } from 'chai';
import express from 'express';
import loanRoutes from '../src/routes/loanRoutes'; 
import bookRoutes from '../src/routes/bookRoutes';
import sequelize from '../src/config/database';

const app = express();
app.use(express.json());
app.use(bookRoutes);
app.use(loanRoutes);

