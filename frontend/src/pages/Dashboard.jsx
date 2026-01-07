import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ count: 0, totalAmount: 0, successRate: 0 });
  
  // FORM STATE
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const apiKey = "key_test_abc123";
  const apiSecret = "secret_test_xyz789";

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/payments');
        const transactions = await res.json();
        const totalCount = transactions.length;
        const successfulTx = transactions.filter(t => t.status === 'success');
        const totalVol = successfulTx.reduce((sum, t) => sum + parseInt(t.amount), 0);
        const rate = totalCount > 0 ? ((successfulTx.length / totalCount) * 100).toFixed(0) : 0;
        setStats({ count: totalCount, totalAmount: totalVol, successRate: rate });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  // --- MODIFIED: AUTO-REDIRECT FUNCTION ---
  const handleProceedToPay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-api-secret': apiSecret
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR"
        })
      });

      const data = await res.json();

      if (res.ok) {
        // 🚀 AUTO-REDIRECT to Port 3001
        window.location.href = `http://localhost:3001?order_id=${data.id}`;
      } else {
        alert("Error creating order: " + JSON.stringify(data));
        setLoading(false);
      }
    } catch (err) {
      alert("Server error");
      setLoading(false);
    }
  };

  // --- STYLES ---
  const theme = { bg: '#f3f4f6', primary: '#1e293b', accent: '#3b82f6', white: '#ffffff', text: '#1f2937' };

  const styles = {
    wrapper: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: theme.bg },
    sidebar: { width: '250px', backgroundColor: theme.primary, color: theme.white, display: 'flex', flexDirection: 'column', padding: '20px' },
    brand: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' },
    navLink: { display: 'block', padding: '12px 15px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px', marginBottom: '5px' },
    navLinkActive: { backgroundColor: '#334155', color: theme.white, fontWeight: 'bold' },
    main: { flex: 1, padding: '40px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: '800', color: theme.text },
    
    // Cards
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: theme.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    cardLabel: { fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' },
    cardValue: { fontSize: '36px', fontWeight: 'bold', color: theme.primary, marginTop: '10px' },

    // Generator Box
    generatorBox: { backgroundColor: theme.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '40px', borderLeft: `5px solid ${theme.accent}` },
    inputGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', flex: 1 },
    button: { padding: '12px 24px', backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', minWidth: '150px' }
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>PAYMENT<span style={{color: theme.accent}}>GATEWAY</span></div>
        <Link to="/dashboard" style={{...styles.navLink, ...styles.navLinkActive}}>Dashboard</Link>
        <Link to="/dashboard/transactions" style={styles.navLink}>Transactions</Link>
      </div>

      {/* Main Content */}
      <div style={styles.main} data-test-id="dashboard">
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
        </div>

        {/* Stats */}
        <div data-test-id="stats-container" style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Total Transactions</div>
            <div data-test-id="total-transactions" style={styles.cardValue}>{stats.count}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Total Volume</div>
            <div data-test-id="total-amount" style={{...styles.cardValue, color: '#10b981'}}>₹{stats.totalAmount.toLocaleString()}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Success Rate</div>
            <div data-test-id="success-rate" style={{...styles.cardValue, color: '#3b82f6'}}>{stats.successRate}%</div>
          </div>
        </div>

        {/* NEW: Direct Payment Action */}
        <div style={styles.generatorBox}>
          <h3 style={{margin: 0, color: theme.primary}}>⚡ Initiate New Payment</h3>
          <p style={{color: '#6b7280', fontSize: '14px'}}>Create an order and proceed directly to the secure checkout page.</p>
          
          <form onSubmit={handleProceedToPay} style={styles.inputGroup}>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              style={styles.input}
              placeholder="Enter Amount (e.g. 500)"
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Redirecting..." : "Proceed to Pay →"}
            </button>
          </form>
        </div>

        {/* Credentials */}
        <div data-test-id="api-credentials" style={{...styles.card, background: '#1e293b', color: 'white'}}>
          <h3 style={{margin: '0 0 15px 0', fontSize: '16px'}}>Developer API Keys</h3>
          <div style={{fontFamily: 'monospace', fontSize: '14px', opacity: 0.8}}>
            Key: <span data-test-id="api-key">{apiKey}</span>
            <br/>
            Secret: <span data-test-id="api-secret">{apiSecret}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;