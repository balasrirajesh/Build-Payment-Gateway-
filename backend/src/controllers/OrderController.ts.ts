import { Request, Response } from 'express';
import { query } from '../config/db';

const generateId = (prefix: string) => {
  return prefix + Math.random().toString(36).substr(2, 16);
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    const merchantId = req.headers['x-merchant-id'];

    if (!amount || amount < 100) {
      return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "amount must be at least 100" } });
    }

    // Generate unique ID
    let orderId = generateId('order_');
    let isUnique = false;
    while (!isUnique) {
      const check = await query("SELECT id FROM orders WHERE id=$1", [orderId]);
      if (check.rows.length === 0) isUnique = true;
      else orderId = generateId('order_');
    }

    const result = await query(
      `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'created') RETURNING *`,
      [orderId, merchantId, amount, currency || 'INR', receipt, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getOrderPublic = async (req: Request, res: Response) => {
  try {
    // Only return safe public info
    const result = await query('SELECT id, amount, currency, status FROM orders WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};