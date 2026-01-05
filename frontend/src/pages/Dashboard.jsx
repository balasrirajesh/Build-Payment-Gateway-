import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ count: 0, totalAmount: 0, successRate: 0 });
  const apiKey = localStorage.getItem('apiKey');
  const apiSecret = localStorage.getItem('apiSecret');

  // Fetch stats from backend (simulated for now based on project reqs)
  useEffect(() => {
    // In a real app, you would fetch aggregated stats from an API endpoint.
    // For this deliverable, we can just display the credentials as required.
  }, []);

  return (
    <div data-test-id="dashboard" style={{ padding: '2rem' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ marginRight: '1rem', fontWeight: 'bold' }}>Home</Link>
        <Link to="/dashboard/transactions">Transactions</Link>
      </nav>

      <h1>Merchant Dashboard</h1>

      <div data-test-id="api-credentials" style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h3>API Credentials</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>API Key:</label>
          <span data-test-id="api-key">{apiKey}</span>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>API Secret:</label>
          <span data-test-id="api-secret">{apiSecret}</span>
        </div>
      </div>

      <div data-test-id="stats-container" style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Transactions</h3>
          <div data-test-id="total-transactions" style={{ fontSize: '2rem' }}>Loading...</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Total Volume</h3>
          <div data-test-id="total-amount" style={{ fontSize: '2rem' }}>Loading...</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Success Rate</h3>
          <div data-test-id="success-rate" style={{ fontSize: '2rem' }}>Loading...</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;