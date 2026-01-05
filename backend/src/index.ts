import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { query } from './config/db';
import { createOrder, getOrder } from './controllers/OrderController.ts';
import { createPayment , getPayment } from  './controllers/PaymentController';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize Database Function
// Initialize Database Function
const initDB = async () => {
  try {
    // FIX: Point to ../src/resources because the SQL file is not copied to dist
    const schemaPath = path.join(__dirname, '../src/resources/schema.sql');
    
    // Verify file exists before reading
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute Schema
    await query(schemaSql);
    console.log("✅ Database Schema Applied");

    // Seed Test Merchant
    const testMerchant = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Merchant',
      email: process.env.TEST_MERCHANT_EMAIL || 'test@example.com',
      api_key: process.env.TEST_API_KEY || 'key_test_abc123',
      api_secret: process.env.TEST_API_SECRET || 'secret_test_xyz789'
    };

    const insertQuery = `
      INSERT INTO merchants (id, name, email, api_key, api_secret)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    await query(insertQuery, [
      testMerchant.id, 
      testMerchant.name, 
      testMerchant.email, 
      testMerchant.api_key, 
      testMerchant.api_secret
    ]);
    console.log("✅ Test Merchant Seeded");

  } catch (err) {
    console.error("❌ Database Initialization Failed:", err);
  }
};

// Health Check
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1'); // Simple query to check connection
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(200).json({
      status: "healthy",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});
// Authentication Middleware (Temporary placeholder)
const authenticate = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Missing credentials" } });
  }

  // Check DB for credentials
  const result = await query('SELECT id FROM merchants WHERE api_key = $1 AND api_secret = $2', [apiKey, apiSecret]);

  if (result.rows.length === 0) {
    return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" } });
  }

  // Attach merchant_id to request headers for the controller to use
  req.headers['x-merchant-id'] = result.rows[0].id;
  next();
};

// Routes
app.post('/api/v1/orders', authenticate, createOrder);
app.get('/api/v1/orders/:id', authenticate, getOrder);

app.post('/api/v1/payments', authenticate, createPayment);
app.get('/api/v1/payments/:id', authenticate, getPayment);

// Start Server only after DB Init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});