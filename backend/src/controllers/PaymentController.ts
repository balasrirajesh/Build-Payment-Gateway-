import { Request, Response } from 'express';
import { query } from '../config/db';
import { validateVPA, validateCardNumber, getCardNetwork, validateExpiry } from '../utils/validation';

// Helper for ID generation
const generatePaymentId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `pay_${result}`;
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id, method, vpa, card } = req.body;
    const merchantId = req.headers['x-merchant-id']; // From auth middleware

    // 1. Verify Order exists and belongs to Merchant
    const orderResult = await query('SELECT * FROM orders WHERE id = $1 AND merchant_id = $2', [order_id, merchantId]);
    if (orderResult.rows.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found or access denied" } });
      return;
    }
    const order = orderResult.rows[0];

    // 2. Validate Payment Method
    let cardNetwork = null;
    let cardLast4 = null;

    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) {
        res.status(400).json({ error: { code: "INVALID_VPA", description: "Invalid VPA format" } });
        return;
      }
    } else if (method === 'card') {
      if (!card || !validateCardNumber(card.number)) {
        res.status(400).json({ error: { code: "INVALID_CARD", description: "Invalid card number (Luhn check failed)" } });
        return;
      }
      if (!validateExpiry(card.expiry_month, card.expiry_year)) {
         res.status(400).json({ error: { code: "EXPIRED_CARD", description: "Card has expired" } });
         return;
      }
      cardNetwork = getCardNetwork(card.number);
      cardLast4 = card.number.slice(-4);
    } else {
      res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Invalid payment method" } });
      return;
    }

    // 3. Create Payment Record (Status: PROCESSING)
    const paymentId = generatePaymentId();
    const insertSql = `
      INSERT INTO payments 
      (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
      VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)
      RETURNING *;
    `;

    const paymentResult = await query(insertSql, [
      paymentId, order_id, merchantId, order.amount, order.currency, method, vpa, cardNetwork, cardLast4
    ]);
    const payment = paymentResult.rows[0];

    // 4. Send "Processing" Response Immediately (Synchronous simulation hack)
    // The requirement asks to return the payment details. 
    // Since we must simulate a delay *before* the final status, 
    // we will actually wait here (blocking the thread) as permitted for Deliverable 1.
    
    const delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000); // 5-10 seconds
    
    // Simulate Delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // 5. Determine Outcome (Random)
    const isTestMode = process.env.TEST_MODE === 'true';
    let success = false;

    if (isTestMode) {
       success = process.env.TEST_PAYMENT_SUCCESS === 'true';
    } else {
       // 90% success for UPI, 95% for Card
       const threshold = method === 'upi' ? 0.9 : 0.95;
       success = Math.random() < threshold;
    }

    const finalStatus = success ? 'success' : 'failed';
    const errorCode = success ? null : 'PAYMENT_FAILED';
    const errorDesc = success ? null : 'Bank declined transaction';

    // 6. Update Database
    const updateSql = `
      UPDATE payments 
      SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const finalResult = await query(updateSql, [finalStatus, errorCode, errorDesc, paymentId]);
    
    // Return Final Result
    res.status(201).json(finalResult.rows[0]);

  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
        return;
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Get Payment Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};