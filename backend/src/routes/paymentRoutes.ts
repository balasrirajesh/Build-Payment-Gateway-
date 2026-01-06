// import { Router } from 'express';
// import { getPayments, createPayment } from '../controllers/PaymentController';

// const router = Router();

// // GET /api/transactions
// router.get('/transactions', getPayments);

// // POST /api/payments (Future use)
// router.post('/payments', createPayment);

// export default router;


import { Router } from 'express';
// Import the functions we just created
import { getPayments, createPayment } from '../controllers/PaymentController';

const router = Router();

// Map the URL to the function
router.get('/transactions', getPayments);
router.post('/payments', createPayment);

export default router;