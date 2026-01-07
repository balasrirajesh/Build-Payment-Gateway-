import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" } });
  }

  try {
    const result = await query(
      'SELECT id FROM merchants WHERE api_key=$1 AND api_secret=$2', 
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" } });
    }

    // Attach merchant_id to the request object for use in controllers
    req.headers['x-merchant-id'] = result.rows[0].id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Authentication server error" });
  }
};