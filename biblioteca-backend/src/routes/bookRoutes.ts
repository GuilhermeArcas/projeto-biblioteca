import { Router } from 'express';
import BookController from '../controllers/BookController';

const router = Router();
//
router.post('/books', BookController.create);
router.get('/books', BookController.list);

export default router;