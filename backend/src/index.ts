import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { query } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Initialize Database Function
const initDB = async () => {
  try {
    // 1. Read the schema file
    const schemaPath = path.join(__dirname, 'resources', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // 2. Execute Schema
    await query(schemaSql);
    console.log("✅ Database Schema Applied");

    // 3. Seed Test Merchant (Required by requirements)
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

// Start Server only after DB Init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});