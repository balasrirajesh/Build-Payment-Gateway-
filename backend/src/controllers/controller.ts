import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // Fallback
import { query } from '../config/db';
import { CreateOrderDTO } from '../models';

// Helper to generate "order_16chars"
const generateOrderId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `order_${result}`;
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get Merchant from Authentication Middleware (we will add this next)
    // For now, we manually fetch the test merchant ID from the header check or DB
    // In a real Spring Boot app, this comes from SecurityContext. 
    // We will assume the middleware (Step 4) sets req.body.merchant_id or similar.
    // For this step, let's validate inputs first.
    
    const { amount, currency, receipt, notes } = req.body as CreateOrderDTO;
    const merchantId = req.headers['x-merchant-id']; // Temporary hack until Step 4

    // Validation
    if (!amount || amount < 100) {
      res.status(400).json({ 
        error: { code: "BAD_REQUEST_ERROR", description: "amount must be at least 100" } 
      });
      return;
    }

    // 2. Generate ID
    const orderId = generateOrderId();

    // 3. Save to Database
    const sql = `
      INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'created')
      RETURNING *;
    `;
    
    // Default currency to INR
    const finalCurrency = currency || 'INR';
    
    const result = await query(sql, [
      orderId, 
      merchantId, 
      amount, 
      finalCurrency, 
      receipt, 
      notes
    ]);

    const order = result.rows[0];

    // 4. Return Response
    res.status(201).json(order);

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ 
        error: { code: "NOT_FOUND_ERROR", description: "Order not found" } 
      });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};