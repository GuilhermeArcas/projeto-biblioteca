import { Router } from 'express';
import LoanController from '../controllers/LoanController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/loans', LoanController.create, AuthMiddleware.handle);
router.post('/loans/return',LoanController.returnBook);

export default router;