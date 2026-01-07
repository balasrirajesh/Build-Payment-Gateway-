# 💳 Payment Gateway Simulation

A **full-stack fintech application** that simulates a real-world **payment gateway / payment aggregator** system.  
This platform enables merchants to onboard, create orders, and accept secure payments via **UPI** and **Credit/Debit Cards** using a **hosted checkout page**.

The system is designed with a **microservices-ready architecture** and is **fully containerized using Docker**, ensuring consistent behavior across all environments.

---

## 🛠️ Tools & Prerequisites

To run this project locally, make sure you have the following installed:

1. **Docker Desktop (Required)**  
   Orchestrates the Backend API, Frontend services, and PostgreSQL database.

2. **Node.js (v18+) (Optional)**  
   Required only if you want to run services individually without Docker.

3. **Git**  
   Used to clone the repository.

4. **Postman / cURL**  
   For testing backend API endpoints.

5. **Modern Web Browser**  
   To access the Merchant Dashboard and Checkout UI.

---

## 💻 Tech Stack

### Backend
- **Node.js** – Runtime environment  
- **TypeScript** – Type safety and maintainability  
- **Express.js** – REST API framework  
- **pg (node-postgres)** – PostgreSQL client  

### Database
- **PostgreSQL (v15)** – Stores merchants, orders, and transactions  

### Frontend
- **React.js** – UI for Dashboard and Checkout  
- **Vite** – Fast frontend build tool  

### DevOps
- **Docker & Docker Compose** – Containerization and service orchestration  

---

## 📂 Project Structure

payment-gateway/
├── backend/                        # API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts               # Database connection logic
│   │   ├── controllers/
│   │   │   ├── OrderController.ts  # Order logic
│   │   │   └── PaymentController.ts# Payment logic
│   │   ├── middleware/
│   │   │   └── auth.ts             # Authentication check
│   │   ├── models/
│   │   │   └── index.ts            # Type definitions (Interfaces)
│   │   ├── resources/
│   │   │   └── schema.sql          # Database table creation SQL
│   │   ├── routes/
│   │   │   ├── orderRoutes.ts      # API routes for orders
│   │   │   └── paymentRoutes.ts    # API routes for payments
│   │   ├── scripts/
│   │   │   └── seed.ts             # Script to populate test data
│   │   ├── utils/
│   │   │   ├── validation.ts       # Validation logic
│   │   │   └── validators.ts       # (Likely duplicate/similar to validation.ts)
│   │   └── index.ts                # Main server entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── checkout-page/                  # Customer Payment UI
│   ├── src/
│   │   ├── App.jsx                 # Checkout page logic
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── frontend/                       # Merchant Dashboard UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Transactions.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .dockerignore
├── .gitignore
├── docker-compose.yml              # Orchestration for all services
└── README.md                       # Project documentation


---

## 🏗️ What This Project Builds

This project implements a **Payment Aggregator System** that connects merchants and customers in a secure and structured manner.

### Key Engineering Highlights
- **Secure Authentication**  
  Merchant APIs are protected using `X-Api-Key` and `X-Api-Secret`.

- **Robust Validation Engine**  
  - Card validation using the **Luhn Algorithm**  
  - UPI ID validation using **Regex patterns**

- **Payment State Machine**  
  Transaction lifecycle handled using states:  
  `created → processing → success / failed`

- **Containerized Architecture**  
  Backend, Frontend, and Database run as isolated Docker containers.

---

## 🚀 Core Functionalities

### Merchant Onboarding
- A test merchant is automatically seeded on startup for quick testing.

### Order Management
- Merchants can create payment orders via authenticated APIs.
- Orders are linked to specific amounts and currencies.

### Secure Payment Processing
- **UPI Payments** – Validates Virtual Payment Addresses (e.g., `user@bank`)
- **Card Payments** – Validates card numbers and detects card networks
- Sensitive card data is **never stored fully** (only last 4 digits).

### Hosted Checkout Page
- Public-facing payment page for customers.
- No secret keys exposed to the browser.

### Real-Time Merchant Dashboard
- View total payment volume
- Transaction success rate
- Detailed transaction logs

---

## ⚙️ How the System Works

1. **Merchant Creates an Order**  
   Merchant logs into the dashboard and enters an amount.

2. **Order Link Generated**  
   Backend generates a unique `order_id`.

3. **Customer Makes Payment**  
   Customer is redirected to the hosted checkout page.

4. **Validation & Processing**  
   Payment details are validated and processed with simulated bank delay.

5. **Final Result**  
   Transaction is marked as **Success** or **Failed**, and the dashboard updates instantly.

---

## 🔄 Data Flow (Payment Simulation)

> No real money moves — only data, exactly like real fintech systems.

### Step 1: Authenticated Order Creation
- **From:** Merchant Dashboard  
- **To:** Backend API  
- **Security:** API Key & Secret  

### Step 2: Public Payment Submission
- **From:** Checkout Page  
- **To:** Backend API  
- **Security:** Order ID validation (no secret exposure)

### Step 3: Database Update
- **From:** Backend API  
- **To:** PostgreSQL  
- **Action:** Transaction status update

---

## 🌐 Services & Local URLs

| Service              | Port | URL                    | Purpose |
|----------------------|------|------------------------|---------|
| Merchant Dashboard   | 3000 | http://localhost:3000 | Merchant UI |
| Checkout Page        | 3001 | http://localhost:3001 | Customer Payment UI |
| Backend API          | 8000 | http://localhost:8000 | Business Logic |
| PostgreSQL Database  | 5432 | localhost:5432        | Data Storage |

---

## 🎨 UI Overview

### Merchant Dashboard
- Secure login page  
- Revenue and transaction statistics  
- Order creation panel  
- Transaction history with status badges  

### Hosted Checkout Page
- Order summary and amount  
- Payment method selector (UPI / Card)  
- Dynamic form validation  
- Processing animation  
- Clear success / failure result  

---

## 🏁 Conclusion

This project goes beyond basic CRUD applications and demonstrates **real-world fintech engineering concepts**, including:

- Secure API authentication
- Financial data validation using algorithms
- Transaction state management
- Microservices-style containerized architecture

It closely mirrors how **professional payment gateways** are designed and operated.

---

🚀 **Built to learn, simulate, and showcase fintech system design.**
