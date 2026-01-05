import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Transactions = () => {
  // We will implement the actual API fetch in the next step
  return (
    <div style={{ padding: '2rem' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/dashboard/transactions" style={{ fontWeight: 'bold' }}>Transactions</Link>
      </nav>

      <h1>Transaction History</h1>
      
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
           {/* We will map data here later */}
           <tr><td colSpan="6">No transactions loaded yet</td></tr>
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;