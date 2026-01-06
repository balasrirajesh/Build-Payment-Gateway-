import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ count: 0, totalAmount: 0, successRate: 0 });
  const apiKey = "key_test_abc123";
  const apiSecret = "secret_test_xyz789";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/payments');
        const transactions = await res.json();
        const totalCount = transactions.length;
        const successfulTx = transactions.filter(t => t.status === 'success');
        const totalVol = successfulTx.reduce((sum, t) => sum + parseInt(t.amount), 0);
        const rate = totalCount > 0 ? ((successfulTx.length / totalCount) * 100).toFixed(0) : 0;
        setStats({ count: totalCount, totalAmount: totalVol, successRate: rate });
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };
    fetchStats();
  }, []);

  // --- MODERN THEME STYLES ---
  const theme = {
    bg: '#f3f4f6', // Light Gray Background
    primary: '#1e293b', // Dark Slate Blue
    accent: '#3b82f6', // Bright Blue
    white: '#ffffff',
    success: '#10b981',
    text: '#1f2937',
    textLight: '#6b7280'
  };

  const styles = {
    wrapper: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: theme.bg },
    sidebar: { width: '250px', backgroundColor: theme.primary, color: theme.white, display: 'flex', flexDirection: 'column', padding: '20px' },
    brand: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' },
    navLink: { display: 'block', padding: '12px 15px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px', marginBottom: '5px', transition: '0.3s' },
    navLinkActive: { backgroundColor: '#334155', color: theme.white, fontWeight: 'bold' },
    main: { flex: 1, padding: '40px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: '800', color: theme.text, margin: 0 },
    subTitle: { color: theme.textLight, marginTop: '5px' },
    
    // Cards Section
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: theme.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    cardLabel: { fontSize: '14px', color: theme.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
    cardValue: { fontSize: '36px', fontWeight: 'bold', color: theme.primary, marginTop: '10px' },
    
    // Credentials Box
    credBox: { backgroundColor: theme.white, padding: '30px', borderRadius: '12px', borderLeft: `5px solid ${theme.accent}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    credRow: { display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '16px' },
    credLabel: { width: '120px', fontWeight: '600', color: theme.text },
    credValue: { fontFamily: "'Courier New', monospace", background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', color: theme.primary }
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar Navigation */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>PAYMENT<span style={{color: theme.accent}}>GATEWAY</span></div>
        <Link to="/dashboard" style={{...styles.navLink, ...styles.navLinkActive}}>Dashboard</Link>
        <Link to="/dashboard/transactions" style={styles.navLink}>Transactions</Link>
      </div>

      {/* Main Content */}
      <div style={styles.main} data-test-id="dashboard">
        <div style={styles.header}>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subTitle}>Welcome back, Test Merchant</p>
        </div>

        {/* Stats Cards */}
        <div data-test-id="stats-container" style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Total Transactions</div>
            <div data-test-id="total-transactions" style={styles.cardValue}>{stats.count}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Total Volume</div>
            <div data-test-id="total-amount" style={{...styles.cardValue, color: theme.success}}>
              ₹{stats.totalAmount.toLocaleString()}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Success Rate</div>
            <div data-test-id="success-rate" style={{...styles.cardValue, color: theme.accent}}>
              {stats.successRate}%
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div data-test-id="api-credentials" style={styles.credBox}>
          <h3 style={{margin: '0 0 20px 0', color: theme.primary}}>Developer API Keys</h3>
          <div style={styles.credRow}>
            <span style={styles.credLabel}>API Key:</span>
            <span data-test-id="api-key" style={styles.credValue}>{apiKey}</span>
          </div>
          <div style={{...styles.credRow, marginBottom: 0}}>
            <span style={styles.credLabel}>API Secret:</span>
            <span data-test-id="api-secret" style={styles.credValue}>{apiSecret}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;