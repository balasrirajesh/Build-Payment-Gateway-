import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // For Deliverable 1, we just accept the test credentials
    if (email === 'test@example.com') {
      // Store credentials in localStorage for other pages to use
      localStorage.setItem('merchantEmail', email);
      localStorage.setItem('apiKey', 'key_test_abc123'); 
      localStorage.setItem('apiSecret', 'secret_test_xyz789');
      navigate('/dashboard');
    } else {
      alert('Use test@example.com');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Merchant Login</h1>
      <form data-test-id="login-form" onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            data-test-id="email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            data-test-id="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button data-test-id="login-button" type="submit" style={{ padding: '10px 20px' }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        Hint: Use <b>test@example.com</b> and any password.
      </p>
    </div>
  );
};

export default Login;