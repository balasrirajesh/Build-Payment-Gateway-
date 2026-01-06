import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Transactions = () => {
  // 1. State to store the data and loading status
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch data when the component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // fetching from your API running on port 8000
        const response = await fetch('http://localhost:8000/api/transactions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data); // Update state with API data
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/dashboard/transactions" style={{ fontWeight: 'bold' }}>Transactions</Link>
      </nav>

      <h1>Transaction History</h1>

      {/* 3. Show loading or error states */}
      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <table data-test-id="transactions-table" border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. Map through the data */}
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.order_id}</td>
                  <td>${tx.amount}</td>
                  <td>{tx.payment_method || 'N/A'}</td>
                  <td>
                    <span style={{ 
                      color: tx.status === 'success' ? 'green' : 'red',
                      fontWeight: 'bold' 
                    }}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;