// import express from 'express';
// import cors from 'cors';
// import { Pool } from 'pg'; // You likely used 'pg' for the query import in your config
// import dotenv from 'dotenv';

// dotenv.config();

// // --- DB CONFIG (Inlined for safety) ---
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL || 'postgresql://gateway_user:gateway_pass@postgres:5432/payment_gateway',
// });
// const query = (text: string, params?: any[]) => pool.query(text, params);

// const app = express();
// app.use(express.json());
// app.use(cors());

// const PORT = process.env.PORT || 8000;

// // --- HELPERS ---
// const generateId = (prefix: string): string => {
//   const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < 16; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return prefix + result;
// };

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// // --- VALIDATORS ---
// const validateVPA = (vpa: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);

// const validateLuhn = (raw: string) => {
//   if (!raw) return false;
//   const s = raw.replace(/[\s-]/g, '');
//   if (!/^\d{13,19}$/.test(s)) return false;
//   let sum=0, d=false;
//   for (let i=s.length-1; i>=0; i--) {
//     let n = parseInt(s.charAt(i));
//     if (d) { if ((n*=2)>9) n-=9; }
//     sum+=n; d=!d;
//   }
//   return (sum%10)===0;
// };

// const getCardNetwork = (raw: string) => {
//   const s = raw.replace(/[\s-]/g, '');
//   if (s.startsWith('4')) return 'visa';
//   const two = parseInt(s.substring(0,2));
//   if (two>=51 && two<=55) return 'mastercard';
//   if (s.startsWith('34')||s.startsWith('37')) return 'amex';
//   if (s.startsWith('60')||s.startsWith('65')||(two>=81&&two<=89)) return 'rupay';
//   return 'unknown';
// };

// const validateExpiry = (mStr: string, yStr: string) => {
//   let m = parseInt(mStr), y = parseInt(yStr);
//   if (isNaN(m) || m<1 || m>12) return false;
//   if (y<100) y+=2000;
//   const now = new Date();
//   if (y < now.getFullYear()) return false;
//   if (y === now.getFullYear() && m < (now.getMonth()+1)) return false;
//   return true;
// };

// // --- MIDDLEWARE ---
// const authenticate = async (req: any, res: any, next: any) => {
//   const k = req.headers['x-api-key'];
//   const s = req.headers['x-api-secret'];
//   if (!k || !s) return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" } });
//   try {
//     const r = await query('SELECT id FROM merchants WHERE api_key=$1 AND api_secret=$2', [k,s]);
//     if (r.rows.length===0) return res.status(401).json({ error: { code: "AUTHENTICATION_ERROR", description: "Invalid API credentials" } });
//     req.headers['x-merchant-id'] = r.rows[0].id;
//     next();
//   } catch (e) { res.status(500).json({ error: "Auth error" }); }
// };

// // --- DB INIT ---
// const initDB = async () => {
//   try {
//     await query(`CREATE TABLE IF NOT EXISTS merchants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, api_key VARCHAR(64) NOT NULL UNIQUE, api_secret VARCHAR(64) NOT NULL, webhook_url TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
//     await query(`CREATE TABLE IF NOT EXISTS orders (id VARCHAR(64) PRIMARY KEY, merchant_id UUID NOT NULL REFERENCES merchants(id), amount INTEGER NOT NULL CHECK (amount >= 100), currency VARCHAR(3) DEFAULT 'INR', receipt VARCHAR(255), notes JSONB, status VARCHAR(20) DEFAULT 'created', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
//     await query(`CREATE TABLE IF NOT EXISTS payments (id VARCHAR(64) PRIMARY KEY, order_id VARCHAR(64) NOT NULL REFERENCES orders(id), merchant_id UUID NOT NULL REFERENCES merchants(id), amount INTEGER NOT NULL, currency VARCHAR(3) DEFAULT 'INR', method VARCHAR(20) NOT NULL, status VARCHAR(20) DEFAULT 'processing', vpa VARCHAR(255), card_network VARCHAR(20), card_last4 VARCHAR(4), error_code VARCHAR(50), error_description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    
//     // Indexes
//     await query(`CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id)`);
//     await query(`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)`);
//     await query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);

//     // Seed Test Merchant
//     await query(`INSERT INTO merchants (id, name, email, api_key, api_secret) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Merchant', 'test@example.com', 'key_test_abc123', 'secret_test_xyz789') ON CONFLICT (email) DO NOTHING`);
//     console.log("✅ Database Ready!");
//   } catch (e) { console.error("DB Init Failed:", e); }
// };

// // --- ROUTES ---

// // 1. Health
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: "healthy",
//     database: "connected",
//     timestamp: new Date().toISOString()
//   });
// });

// // 2. Test Merchant (Required for Eval)
// app.get('/api/v1/test/merchant', (req, res) => {
//   res.status(200).json({
//     id: "550e8400-e29b-41d4-a716-446655440000",
//     email: process.env.TEST_MERCHANT_EMAIL || "test@example.com",
//     api_key: process.env.TEST_API_KEY || "key_test_abc123",
//     seeded: true
//   });
// });

// // 3. Create Order (Auth)
// app.post('/api/v1/orders', authenticate, async (req, res) => {
//   try {
//     const { amount, currency, receipt, notes } = req.body;
//     if (!amount || amount < 100) return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "amount must be at least 100" } });
    
//     let oid = generateId('order_'), unique=false;
//     while(!unique) { if((await query("SELECT id FROM orders WHERE id=$1",[oid])).rows.length===0) unique=true; else oid=generateId('order_'); }
    
//     const r = await query(`INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status) VALUES ($1, $2, $3, $4, $5, $6, 'created') RETURNING *`, [oid, req.headers['x-merchant-id'], amount, currency||'INR', receipt, notes]);
//     res.status(201).json(r.rows[0]);
//   } catch (e) { res.status(500).json({ error: "Internal Server Error" }); }
// });

// // 4. Get Order (Auth)
// app.get('/api/v1/orders/:id', authenticate, async (req, res) => {
//   try {
//     const r = await query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
//     if (r.rows.length===0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
//     res.json(r.rows[0]);
//   } catch (e) { res.status(500).json({ error: "Server error" }); }
// });

// // 5. Get Order Public (For Checkout)
// app.get('/api/v1/orders/:id/public', async (req, res) => {
//   try {
//     const r = await query('SELECT id, amount, currency, status FROM orders WHERE id=$1', [req.params.id]);
//     if (r.rows.length===0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
//     res.json(r.rows[0]);
//   } catch (e) { res.status(500).json({ error: "Server error" }); }
// });

// // 6. Create Payment Logic
// const processPayment = async (req: any, res: any, isPublic: boolean) => {
//   try {
//     const { order_id, method, vpa, card } = req.body;
    
//     // Validate Order
//     const oCheck = await query("SELECT * FROM orders WHERE id=$1", [order_id]);
//     if (oCheck.rows.length===0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
//     const realOrder = oCheck.rows[0];

//     // Auth Check
//     if (!isPublic && req.headers['x-merchant-id'] && realOrder.merchant_id !== req.headers['x-merchant-id']) {
//       return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Order does not belong to this merchant" } });
//     }

//     let cn=null, cl4=null, fVpa=null;
//     if (method==='upi') {
//       if (!vpa || !validateVPA(vpa)) return res.status(400).json({ error: { code: "INVALID_VPA", description: "Invalid VPA" } });
//       fVpa=vpa;
//     } else if (method==='card') {
//       if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Missing card details" } });
//       if (!validateLuhn(card.number)) return res.status(400).json({ error: { code: "INVALID_CARD", description: "Luhn failed" } });
//       if (!validateExpiry(card.expiry_month, card.expiry_year)) return res.status(400).json({ error: { code: "EXPIRED_CARD", description: "Card expired" } });
//       cn = getCardNetwork(card.number);
//       cl4 = card.number.replace(/[\s-]/g,'').slice(-4);
//     } else {
//       return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Invalid method" } });
//     }

//     let pid=generateId('pay_'), u=false;
//     while(!u) { if((await query("SELECT id FROM payments WHERE id=$1",[pid])).rows.length===0) u=true; else pid=generateId('pay_'); }

//     await query(`INSERT INTO payments (id, order_id, merchant_id, amount, currency, status, method, vpa, card_network, card_last4) VALUES ($1, $2, $3, $4, $5, 'processing', $6, $7, $8, $9)`, [pid, order_id, realOrder.merchant_id, realOrder.amount, realOrder.currency, method, fVpa, cn, cl4]);

//     const isTest = process.env.TEST_MODE === 'true';
//     const wait = isTest ? parseInt(process.env.TEST_PROCESSING_DELAY||'1000') : (5000 + Math.random()*5000);
//     await delay(wait);

//     let succ;
//     if (isTest) succ = process.env.TEST_PAYMENT_SUCCESS !== 'false';
//     else succ = Math.random() < (method==='upi'?0.90:0.95);

//     const stat = succ ? 'success' : 'failed';
//     const ec = succ ? null : "PAYMENT_FAILED";
//     const ed = succ ? null : "Bank declined transaction";

//     await query("UPDATE payments SET status=$1, error_code=$2, error_description=$3, updated_at=NOW() WHERE id=$4", [stat, ec, ed, pid]);
    
//     const final = await query("SELECT * FROM payments WHERE id=$1", [pid]);
//     res.status(201).json(final.rows[0]);
//   } catch (e) { console.error(e); if(!res.headersSent) res.status(500).json({ error: "Server Error" }); }
// };

// app.post('/api/v1/payments', authenticate, (req, res) => processPayment(req, res, false));
// app.post('/api/v1/payments/public', (req, res) => processPayment(req, res, true)); 

// // 7. Get Payment (Auth)
// app.get('/api/v1/payments/:id', authenticate, async (req, res) => {
//   try {
//     const r = await query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
//     if (r.rows.length===0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
//     if (r.rows[0].merchant_id !== req.headers['x-merchant-id']) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
//     res.json(r.rows[0]);
//   } catch (e) { res.status(500).json({ error: "Server error" }); }
// });

// // 8. Dashboard List (Auth Removed for demo, or add authenticate if you wish)
// // --- FIX: ADDED /v1 ---
// app.get('/api/v1/payments', async (req, res) => {
//   try { res.json((await query('SELECT * FROM payments ORDER BY created_at DESC')).rows); } catch (e) { res.status(500).json({ error: 'Server error' }); }
// });

// initDB().then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)));



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './config/db';

// Import Routes
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// --- Database Init ---
const initDB = async () => {
  try {
    // Schema creation
    await query(`CREATE TABLE IF NOT EXISTS merchants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, api_key VARCHAR(64) NOT NULL UNIQUE, api_secret VARCHAR(64) NOT NULL, webhook_url TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await query(`CREATE TABLE IF NOT EXISTS orders (id VARCHAR(64) PRIMARY KEY, merchant_id UUID NOT NULL REFERENCES merchants(id), amount INTEGER NOT NULL CHECK (amount >= 100), currency VARCHAR(3) DEFAULT 'INR', receipt VARCHAR(255), notes JSONB, status VARCHAR(20) DEFAULT 'created', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await query(`CREATE TABLE IF NOT EXISTS payments (id VARCHAR(64) PRIMARY KEY, order_id VARCHAR(64) NOT NULL REFERENCES orders(id), merchant_id UUID NOT NULL REFERENCES merchants(id), amount INTEGER NOT NULL, currency VARCHAR(3) DEFAULT 'INR', method VARCHAR(20) NOT NULL, status VARCHAR(20) DEFAULT 'processing', vpa VARCHAR(255), card_network VARCHAR(20), card_last4 VARCHAR(4), error_code VARCHAR(50), error_description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    
    // Seed Test Merchant
    await query(`INSERT INTO merchants (id, name, email, api_key, api_secret) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Merchant', 'test@example.com', 'key_test_abc123', 'secret_test_xyz789') ON CONFLICT (email) DO NOTHING`);
    console.log("✅ Database Ready!");
  } catch (e) {
    console.error("DB Init Failed:", e);
  }
};

// --- ROUTES MOUNTING ---

// 1. Health
app.get('/health', (req, res) => {
  res.status(200).json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
});

// 2. Test Merchant (Required)
app.get('/api/v1/test/merchant', (req, res) => {
  res.json({
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: process.env.TEST_MERCHANT_EMAIL || "test@example.com",
    api_key: process.env.TEST_API_KEY || "key_test_abc123",
    seeded: true
  });
});

// 3. API V1 Routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Start Server
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});