import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

// Vincula o método POST à função create do UserController
router.post('/users', UserController.create);

export default router;