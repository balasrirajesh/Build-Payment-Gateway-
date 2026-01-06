import { query } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting Database Seed...");

    // 1. Ensure Test Merchant Exists
    const merchantId = '550e8400-e29b-41d4-a716-446655440000';
    await query(`
      INSERT INTO merchants (id, name, email, api_key, api_secret)
      VALUES ($1, 'Test Merchant', 'test@example.com', 'key_123', 'secret_456')
      ON CONFLICT (id) DO NOTHING;
    `, [merchantId]);
    console.log("✅ Merchant ensured.");

    // 2. Ensure Test Order Exists (This fixes your error!)
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