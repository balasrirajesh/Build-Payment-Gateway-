import React, { useState } from 'react';

function App() {
  const [amount, setAmount] = useState(100);
  const [status, setStatus] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      const response = await fetch('http://localhost:8000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: "order_test_123",
          merchant_id: "550e8400-e29b-41d4-a716-446655440000",
          amount: parseInt(amount),
          currency: "INR",
          method: "UPI"
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ Payment Successful! ID: ${data.id}`);
      } else {
        setStatus(`❌ Payment Failed: ${data.message || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Connection Error. Is Backend (8000) running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Secure Checkout</h2>
      
      <form onSubmit={handlePayment}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount (INR)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
        >
          Pay Now
        </button>
      </form>

      {status && (
        <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default App;