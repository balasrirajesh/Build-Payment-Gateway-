import React, { useState, useEffect } from 'react';

const useQuery = () => {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search));
  return query;
};

function App() {
  const query = useQuery();
  const orderId = query.get('order_id');

  const [amount, setAmount] = useState(0); 
  const [method, setMethod] = useState('upi'); // Default to UPI
  const [status, setStatus] = useState('initial'); // initial, processing, success, failed
  
  // Form Inputs
  const [vpa, setVpa] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  
  const [paymentId, setPaymentId] = useState('');

  // Fetch Order
  useEffect(() => {
    if (orderId) {
      fetch(`http://localhost:8000/api/v1/orders/${orderId}/public`)
        .then(res => res.json())
        .then(data => { if(data.amount) setAmount(data.amount); })
        .catch(console.error);
    }
  }, [orderId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus('processing');

    const payload = { order_id: orderId, method };
    if (method === 'upi') payload.vpa = vpa;
    else {
      const [m, y] = expiry.split('/');
      payload.card = { number: cardNumber, expiry_month: m, expiry_year: y, cvv, holder_name: name };
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/payments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setPaymentId(data.id);
        if (data.status === 'processing') {
            const interval = setInterval(() => {
                if (data.status === 'success' || data.status === 'failed') {
                    setStatus(data.status);
                    clearInterval(interval);
                }
            }, 1000);
            setStatus(data.status); 
        } else {
            setStatus(data.status);
        }
      } else {
        setStatus('failed');
      }
    } catch (err) { setStatus('failed'); }
  };

  // --- STYLES ---
  const styles = {
    wrapper: { 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f1f5f9', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif" 
    },
    card: { 
      width: '100%', 
      maxWidth: '440px', 
      background: '#ffffff', 
      borderRadius: '24px', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
      overflow: 'hidden',
      margin: '20px'
    },
    header: { 
      background: '#0f172a', 
      padding: '40px 30px', 
      color: 'white', 
      textAlign: 'center',
      position: 'relative'
    },
    amountLabel: { 
      textTransform: 'uppercase', 
      fontSize: '11px', 
      letterSpacing: '2px', 
      opacity: 0.7, 
      fontWeight: '600'
    },
    amount: { 
      fontSize: '48px', 
      fontWeight: '700', 
      margin: '8px 0',
      letterSpacing: '-1px'
    },
    orderTag: { 
      background: 'rgba(255,255,255,0.1)', 
      padding: '6px 12px', 
      borderRadius: '20px', 
      fontSize: '12px', 
      display: 'inline-block',
      marginTop: '10px'
    },
    body: { padding: '32px' },
    
    // Tabs
    tabGroup: { 
      display: 'flex', 
      background: '#f1f5f9', 
      padding: '4px', 
      borderRadius: '12px', 
      marginBottom: '28px' 
    },
    tab: (active) => ({ 
      flex: 1, 
      padding: '10px', 
      textAlign: 'center', 
      borderRadius: '10px', 
      cursor: 'pointer', 
      fontSize: '14px', 
      fontWeight: '600', 
      border: 'none',
      background: active ? '#ffffff' : 'transparent', 
      color: active ? '#0f172a' : '#64748b', 
      boxShadow: active ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s ease'
    }),

    // Inputs
    label: { 
      display: 'block', 
      fontSize: '12px', 
      fontWeight: '700', 
      color: '#475569', 
      marginBottom: '8px', 
      textTransform: 'uppercase' 
    },
    input: { 
      width: '100%', 
      padding: '14px 16px', 
      borderRadius: '10px', 
      border: '1px solid #e2e8f0', 
      fontSize: '15px', 
      marginBottom: '20px', 
      boxSizing: 'border-box', 
      outline: 'none',
      transition: 'border-color 0.2s',
      background: '#f8fafc'
    },
    row: { display: 'flex', gap: '16px' },
    
    // Action Button
    payBtn: { 
      width: '100%', 
      padding: '16px', 
      background: '#10b981', 
      color: 'white', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '16px', 
      fontWeight: '600', 
      cursor: 'pointer', 
      marginTop: '10px',
      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
      transition: 'transform 0.1s'
    },
    
    // Status Screens
    statusBox: { textAlign: 'center', padding: '40px 10px' },
    icon: { fontSize: '64px', marginBottom: '24px', display: 'block' },
    statusTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' },
    statusText: { color: '#64748b', fontSize: '15px', lineHeight: '1.5' },
    retryBtn: { 
      marginTop: '24px', 
      padding: '12px 24px', 
      background: '#e2e8f0', 
      color: '#334155', 
      border: 'none', 
      borderRadius: '8px', 
      fontWeight: '600', 
      cursor: 'pointer' 
    }
  };

  // Add simple hover effect logic via CSS class injection for spinner
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
      input:focus { border-color: #3b82f6 !important; background: #fff !important; }
      button:active { transform: scale(0.98); }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  if (!orderId) return (
    <div style={styles.wrapper}>
      <div style={{...styles.card, padding: 40, textAlign: 'center'}}>
        <span style={{fontSize: 40, display: 'block', marginBottom: 20}}>⚠️</span>
        <h3 style={styles.statusTitle}>Invalid Request</h3>
        <p style={styles.statusText}>Missing Order ID parameter.</p>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} data-test-id="checkout-container">
        
        {/* Header */}
        <div style={styles.header} data-test-id="order-summary">
          <div style={styles.amountLabel}>Total Payable</div>
          <div style={styles.amount} data-test-id="order-amount">₹{amount}.00</div>
          <div style={styles.orderTag}>Order ID: <span data-test-id="order-id">{orderId}</span></div>
        </div>

        <div style={styles.body}>
          {status === 'initial' && (
            <>
              {/* Method Tabs */}
              <div style={styles.tabGroup} data-test-id="payment-methods">
                <button onClick={() => setMethod('upi')} style={styles.tab(method === 'upi')} data-test-id="method-upi">UPI / VPA</button>
                <button onClick={() => setMethod('card')} style={styles.tab(method === 'card')} data-test-id="method-card">Debit / Credit Card</button>
              </div>

              {/* UPI Form */}
              {method === 'upi' && (
                <form data-test-id="upi-form" onSubmit={handlePay}>
                  <label style={styles.label}>UPI Address</label>
                  <input 
                    data-test-id="vpa-input" 
                    type="text" 
                    placeholder="username@bank" 
                    value={vpa} onChange={e=>setVpa(e.target.value)} 
                    required 
                    style={styles.input}
                  />
                  <button data-test-id="pay-button" type="submit" style={styles.payBtn}>
                    Pay ₹{amount}
                  </button>
                </form>
              )}

              {/* Card Form */}
              {method === 'card' && (
                <form data-test-id="card-form" onSubmit={handlePay}>
                  <label style={styles.label}>Card Number</label>
                  <input 
                    data-test-id="card-number-input" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber} onChange={e=>setCardNumber(e.target.value)} 
                    required 
                    style={styles.input}
                  />
                  
                  <div style={styles.row}>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Expiry Date</label>
                      <input 
                        data-test-id="expiry-input" 
                        placeholder="MM/YY" 
                        value={expiry} onChange={e=>setExpiry(e.target.value)} 
                        required 
                        style={styles.input}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>CVV / CVC</label>
                      <input 
                        data-test-id="cvv-input" 
                        placeholder="123" 
                        value={cvv} onChange={e=>setCvv(e.target.value)} 
                        required 
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <label style={styles.label}>Cardholder Name</label>
                  <input 
                    data-test-id="cardholder-name-input" 
                    placeholder="Full Name as on Card" 
                    value={name} onChange={e=>setName(e.target.value)} 
                    required 
                    style={styles.input}
                  />

                  <button data-test-id="pay-button" type="submit" style={styles.payBtn}>
                    Pay ₹{amount}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div style={styles.statusBox} data-test-id="processing-state">
              <div className="spinner"></div>
              <h3 style={styles.statusTitle}>Processing Payment</h3>
              <p style={styles.statusText} data-test-id="processing-message">
                Securely contacting the bank...<br/>Please do not close this window.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div style={styles.statusBox} data-test-id="success-state">
              <span style={{...styles.icon, color: '#10b981'}}>✅</span>
              <h3 style={styles.statusTitle}>Payment Successful!</h3>
              <p style={styles.statusText} data-test-id="success-message">
                Your transaction has been completed.
              </p>
              <div style={{background:'#f1f5f9', padding: 10, borderRadius: 8, marginTop: 15, fontFamily: 'monospace'}}>
                Ref ID: <span data-test-id="payment-id" style={{fontWeight:'bold'}}>{paymentId}</span>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div style={styles.statusBox} data-test-id="error-state">
              <span style={{...styles.icon, color: '#ef4444'}}>❌</span>
              <h3 style={styles.statusTitle}>Payment Failed</h3>
              <p style={styles.statusText} data-test-id="error-message">
                The transaction was declined by the bank.
              </p>
              <button style={styles.retryBtn} data-test-id="retry-button" onClick={()=>setStatus('initial')}>
                Try Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;