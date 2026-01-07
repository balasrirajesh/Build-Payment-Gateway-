import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // CORRECT: Uses /v1
    fetch('http://localhost:8000/api/v1/payments')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      // FIX 1: Added /v1 here
      await fetch(`http://localhost:8000/api/v1/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // FIX 2: Added /v1 here for refetching
      const res = await fetch('http://localhost:8000/api/v1/payments');
      setTransactions(await res.json());
      alert(`Payment marked as ${newStatus}`);
    } catch (err) { console.error(err); }
  };

  // --- THEME STYLES (MATCHING DASHBOARD) ---
  const theme = { bg: '#f3f4f6', primary: '#1e293b', white: '#ffffff', text: '#1f2937' };

  const styles = {
    wrapper: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: theme.bg },
    sidebar: { width: '250px', backgroundColor: theme.primary, color: theme.white, display: 'flex', flexDirection: 'column', padding: '20px' },
    brand: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '1px' },
    navLink: { display: 'block', padding: '12px 15px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px', marginBottom: '5px', transition: '0.3s' },
    navLinkActive: { backgroundColor: '#334155', color: theme.white, fontWeight: 'bold' },
    main: { flex: 1, padding: '40px' },
    header: { fontSize: '32px', fontWeight: '800', color: theme.text, marginBottom: '30px' },
    
    // Table Styles
    tableContainer: { backgroundColor: theme.white, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f8fafc', padding: '16px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#334155' },
    row: { transition: 'background-color 0.2s' },
    
    // Badges
    badge: (status) => ({
      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
      backgroundColor: status === 'success' ? '#dcfce7' : status === 'failed' ? '#fee2e2' : '#ffedd5',
      color: status === 'success' ? '#166534' : status === 'failed' ? '#991b1b' : '#9a3412'
    }),
    btn: (color) => ({
      padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', color: 'white', fontSize: '12px', marginRight: '8px',
      backgroundColor: color === 'green' ? '#10b981' : '#ef4444'
    })
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>PAYMENT<span style={{color: '#3b82f6'}}>GATEWAY</span></div>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/dashboard/transactions" style={{...styles.navLink, ...styles.navLinkActive}}>Transactions</Link>
      </div>

      <div style={styles.main}>
        <h1 style={styles.header}>Transactions</h1>
        
        <div style={styles.tableContainer}>
          <table style={styles.table} data-test-id="transactions-table">
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={styles.row} data-test-id="transaction-row" data-payment-id={tx.id}>
                  <td style={{...styles.td, fontFamily: 'monospace'}} data-test-id="payment-id">{tx.id}</td>
                  <td style={styles.td} data-test-id="order-id">{tx.order_id}</td>
                  <td style={{...styles.td, fontWeight: 'bold'}} data-test-id="amount">₹{tx.amount}</td>
                  <td style={styles.td} data-test-id="method">{tx.method || 'N/A'}</td>
                  <td style={styles.td} data-test-id="status">
                    <span style={styles.badge(tx.status)}>{tx.status}</span>
                  </td>
                  <td style={styles.td} data-test-id="created-at">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {tx.status === 'processing' && (
                      <>
                        <button style={styles.btn('green')} onClick={() => updateStatus(tx.id, 'success')}>✓ Approve</button>
                        <button style={styles.btn('red')} onClick={() => updateStatus(tx.id, 'failed')}>✕ Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;