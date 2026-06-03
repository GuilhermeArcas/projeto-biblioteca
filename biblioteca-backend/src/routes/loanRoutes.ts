import { Router } from 'express';
import LoanController from '../controllers/LoanController';

const router = Router();

router.post('/loans', LoanController.create);
router.post('/loans/return', LoanController.returnBook);

export default router;