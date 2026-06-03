import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// Rota pública para os usuários se autenticarem
router.post('/auth/login', AuthController.login);

export default router;