import React, { useState, useEffect } from 'react';

const useQuery = () => {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search));
  return query;
};

function App() {
  const query = useQuery();
  const orderId = query.get('order_id');

  const [amount, setAmount] = useState(500); 
  const [method, setMethod] = useState('upi');
  const [vpa, setVpa] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [status, setStatus] = useState('initial');
  const [paymentId, setPaymentId] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setStatus('processing');

    const payload = {
      order_id: orderId || 'order_test_123',
      merchant_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: amount,
      currency: 'INR',
      method: method,
      vpa: method === 'upi' ? vpa : undefined,
      card_last4: method === 'card' ? cardLast4 : undefined
    };

    try {
      const res = await fetch('http://localhost:8000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPaymentId(data.id);
        const interval = setInterval(async () => {
          const pollRes = await fetch(`http://localhost:8000/api/payments/${data.id}`);
          const pollData = await pollRes.json();
          if (pollData.status === 'success' || pollData.status === 'failed') {
            setStatus(pollData.status);
            clearInterval(interval);
          }
        }, 2000); 
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  };

  const styles = {
    wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
    card: { width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' },
    header: { backgroundColor: '#1e293b', padding: '30px', textAlign: 'center', color: 'white' },
    amount: { fontSize: '36px', fontWeight: 'bold', margin: '10px 0' },
    body: { padding: '30px' },
    tabGroup: { display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '25px' },
    tab: (active) => ({ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s', backgroundColor: active ? '#ffffff' : 'transparent', color: active ? '#1e293b' : '#64748b', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }),
    input: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' },
    payBtn: { width: '100%', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    statusBox: { textAlign: 'center', padding: '20px' }
  };

  if (!orderId) return <div style={{padding: 40, textAlign: 'center', fontFamily: 'sans-serif'}}>❌ Missing order_id</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} data-test-id="checkout-container">
        
        {/* Header Section */}
        <div style={styles.header}>
          <div style={{textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', opacity: 0.8}}>Payable Amount</div>
          <div style={styles.amount} data-test-id="order-amount">₹{amount}.00</div>
          <div style={{fontSize: '13px', opacity: 0.7}}>Order ID: <span data-test-id="order-id">{orderId}</span></div>
        </div>

        <div style={styles.body}>
          {status === 'initial' && (
            <>
              {/* Tabs */}
              <div style={styles.tabGroup} data-test-id="payment-methods">
                <div onClick={() => setMethod('upi')} style={styles.tab(method === 'upi')} data-test-id="method-upi">UPI</div>
                <div onClick={() => setMethod('card')} style={styles.tab(method === 'card')} data-test-id="method-card">Card</div>
              </div>

              {/* Form */}
              <form onSubmit={handlePayment}>
                {method === 'upi' && (
                  <div data-test-id="upi-form">
                    <label style={{display:'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#334155'}}>UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@bank" 
                      style={styles.input} 
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      required
                      data-test-id="vpa-input"
                    />
                  </div>
                )}

                {method === 'card' && (
                  <div data-test-id="card-form">
                    <label style={{display:'block', marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#334155'}}>Card Number (Last 4)</label>
                    <input 
                      type="text" 
                      placeholder="1234" 
                      style={styles.input} 
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      required
                      maxLength={4}
                      data-test-id="card-number-input"
                    />
                  </div>
                )}

                <button type="submit" style={styles.payBtn} data-test-id="pay-button">
                  Pay Now
                </button>
              </form>
            </>
          )}

          {/* Processing */}
          {status === 'processing' && (
            <div style={styles.statusBox} data-test-id="processing-state">
              <div style={{fontSize: '40px', marginBottom: 20}}>⏳</div>
              <h3 style={{color: '#334155', margin: 0}}>Processing...</h3>
              <p style={{color: '#64748b'}}>Please wait while we contact the bank.</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div style={styles.statusBox} data-test-id="success-state">
              <div style={{fontSize: '50px', marginBottom: 20, color: '#10b981'}}>✅</div>
              <h3 style={{color: '#10b981', margin: '0 0 10px 0'}}>Payment Successful!</h3>
              <p style={{color: '#64748b', fontSize: '14px'}}>Transaction ID: <span data-test-id="payment-id" style={{fontWeight: 'bold', fontFamily: 'monospace'}}>{paymentId}</span></p>
              <div data-test-id="success-message" style={{display: 'none'}}>Success</div>
            </div>
          )}

          {/* Failed */}
          {status === 'failed' && (
            <div style={styles.statusBox} data-test-id="error-state">
              <div style={{fontSize: '50px', marginBottom: 20, color: '#ef4444'}}>❌</div>
              <h3 style={{color: '#ef4444', margin: '0 0 10px 0'}}>Payment Failed</h3>
              <button onClick={() => setStatus('initial')} style={{...styles.payBtn, backgroundColor: '#334155', marginTop: 20}} data-test-id="retry-button">Try Again</button>
              <div data-test-id="error-message" style={{display: 'none'}}>Failed</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;