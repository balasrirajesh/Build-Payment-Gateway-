// import { Request, Response } from 'express';

// // Export 1: Get All Payments
// export const getPayments = async (req: Request, res: Response) => {
//   try {
//     const mockData = [
//       {
//         id: "pay_FUNCT_1",
//         order_id: "order_001",
//         amount: 150.00,
//         status: "success",
//         method: "Credit Card",
//         created_at: new Date().toISOString()
//       },
//       {
//         id: "pay_FUNCT_2",
//         order_id: "order_002",
//         amount: 45.50,
//         status: "failed",
//         method: "PayPal",
//         created_at: new Date(Date.now() - 86400000).toISOString()
//       }
//     ];
//     res.status(200).json(mockData);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching payments" });
//   }
// };

// // Export 2: Create Payment
// export const createPayment = async (req: Request, res: Response) => {
//   try {
//     res.status(201).json({ 
//       success: true, 
//       id: "pay_" + Math.random().toString(36).substr(2, 9) 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating payment" });
//   }
// };


import { Request, Response } from 'express';
import { query } from '../config/db';

// 1. Get All Payments (From Real Database)
export const getPayments = async (req: Request, res: Response) => {
  try {
    // Fetch from Postgres, newest first
    const result = await query('SELECT * FROM payments ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

// 2. Create Payment (Save to Real Database)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { order_id, merchant_id, amount, currency, method, status } = req.body;

    // Generate a random ID (or use UUID if you prefer)
    const id = "pay_" + Math.random().toString(36).substr(2, 9);

    const sql = `
      INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await query(sql, [
      id,
      order_id,
      merchant_id,
      amount,
      currency || 'INR',
      method || 'unknown',
      status || 'processing'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Error creating payment" });
  }
};