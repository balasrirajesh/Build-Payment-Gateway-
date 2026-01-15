import { query } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting Database Seed...");

    // 1. Ensure Test Merchant Exists (Updated with webhook_secret)
    const merchantId = '550e8400-e29b-41d4-a716-446655440000';
    await query(`
      INSERT INTO merchants (id, name, email, api_key, api_secret, webhook_secret, webhook_url)
      VALUES ($1, 'Test Merchant', 'test@example.com', 'key_test_abc123', 'secret_test_xyz789', 'whsec_test_abc123', NULL)
      ON CONFLICT (id) DO UPDATE 
      SET webhook_secret = 'whsec_test_abc123';
    `, [merchantId]);
    console.log("✅ Merchant ensured.");

    // 2. Ensure Test Order Exists
    const orderId = 'order_test_123';
    await query(`
      INSERT INTO orders (id, merchant_id, amount, currency, status)
      VALUES ($1, $2, 100, 'INR', 'created')
      ON CONFLICT (id) DO NOTHING;
    `, [orderId, merchantId]);
    console.log("✅ Order 'order_test_123' ensured.");

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();