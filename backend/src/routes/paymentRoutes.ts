import { Router } from 'express';
import { createPayment, createPaymentPublic, getPayment, getAllPayments } from '../controllers/PaymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public Route (Checkout Page)
router.post('/public', createPaymentPublic);

// Authenticated Routes
router.post('/', authenticate, createPayment);
router.get('/:id', authenticate, getPayment);
router.get('/', getAllPayments); // Dashboard List

export default router;