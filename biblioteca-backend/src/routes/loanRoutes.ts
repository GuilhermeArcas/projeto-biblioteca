import { Router } from 'express';
import LoanController from '../controllers/LoanController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/loans', AuthMiddleware.handle, LoanController.listMyLoans);

router.post('/loans', AuthMiddleware.handle, LoanController.create);
router.post('/loans/return', AuthMiddleware.handle, LoanController.returnBook);

export default router;