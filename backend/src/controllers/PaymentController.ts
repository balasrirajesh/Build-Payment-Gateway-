import { Request, Response } from 'express';
import { query } from '../config/db';
import { validateVPA, validateCardNumber, validateExpiry, getCardNetwork } from '../utils/validators';

const generateId = (prefix: string) => prefix + Math.random().toString(36).substr(2, 16);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Shared Logic for both Public and Private Payments
const processPaymentLogic = async (req: Request, res: Response, isPublic: boolean) => {
  try {
    const { order_id, method, vpa, card } = req.body;
    
    // 1. Validate Order
    const oCheck = await query("SELECT * FROM orders WHERE id=$1", [order_id]);
    if (oCheck.rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
    }
    const realOrder = oCheck.rows[0];

    // 2. Auth Check (If Private)
    if (!isPublic && req.headers['x-merchant-id'] && realOrder.merchant_id !== req.headers['x-merchant-id']) {
      return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Order does not belong to this merchant" } });
    }

    // 3. Method Validation
    let cn = null, cl4 = null, fVpa = null;
    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) return res.status(400).json({ error: { code: "INVALID_VPA", description: "Invalid VPA" } });
      fVpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
        return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Missing card details" } });
      }
      if (!validateCardNumber(card.number)) return res.status(400).json({ error: { code: "INVALID_CARD", description: "Luhn failed" } });
      if (!validateExpiry(card.expiry_month, card.expiry_year)) return res.status(400).json({ error: { code: "EXPIRED_CARD", description: "Card expired" } });
      cn = getCardNetwork(card.number);
      cl4 = card.number.replace(/[\s-]/g,'').slice(-4);
    } else {
      return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Invalid method" } });
    }

    // 4. Create "Processing" Record
    let pid = generateId('pay_');
    let u = false;
    while (!u) {
      if ((await query("SELECT id FROM payments WHERE id=$1", [pid])).rows.length === 0) u = true;
      else pid = generateId('pay_');
    }

    await query(
      `INSERT INTO payments (id, order_id, merchant_id, amount, currency, status, method, vpa, card_network, card_last4) 
       VALUES ($1, $2, $3, $4, $5, 'processing', $6, $7, $8, $9)`,
      [pid, order_id, realOrder.merchant_id, realOrder.amount, realOrder.currency, method, fVpa, cn, cl4]
    );

    // 5. Simulate Bank Delay (Sync)
    const isTest = process.env.TEST_MODE === 'true';
    const waitTime = isTest ? parseInt(process.env.TEST_PROCESSING_DELAY || '1000') : (5000 + Math.random() * 5000);
    await delay(waitTime);

    // 6. Determine Outcome
    let isSuccess;
    if (isTest) isSuccess = process.env.TEST_PAYMENT_SUCCESS !== 'false';
    else isSuccess = Math.random() < (method === 'upi' ? 0.90 : 0.95);

    const finalStatus = isSuccess ? 'success' : 'failed';
    const errorCode = isSuccess ? null : "PAYMENT_FAILED";
    const errorDesc = isSuccess ? null : "Bank declined transaction";

    await query(
      "UPDATE payments SET status=$1, error_code=$2, error_description=$3, updated_at=NOW() WHERE id=$4",
      [finalStatus, errorCode, errorDesc, pid]
    );
    
    // 7. Return Result
    const final = await query("SELECT * FROM payments WHERE id=$1", [pid]);
    res.status(201).json(final.rows[0]);

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ error: "Server Error" });
  }
};

export const createPayment = (req: Request, res: Response) => processPaymentLogic(req, res, false);
export const createPaymentPublic = (req: Request, res: Response) => processPaymentLogic(req, res, true);

export const getPayment = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
    
    // Verify Merchant Ownership
    if (result.rows[0].merchant_id !== req.headers['x-merchant-id']) {
      return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    // In production, filtering by merchant_id here is essential
    const result = await query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};