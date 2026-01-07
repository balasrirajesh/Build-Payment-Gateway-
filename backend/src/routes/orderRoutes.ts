import { Router } from 'express';
import { createOrder, getOrder, getOrderPublic } from '../controllers/OrderController.ts';
import { authenticate } from '../middleware/auth';

const router = Router();

// Authenticated Routes
router.post('/', authenticate, createOrder);
router.get('/:id', authenticate, getOrder);

// Public Route (No Auth)
router.get('/:id/public', getOrderPublic);

export default router;