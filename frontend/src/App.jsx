import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Default Route: Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 2. Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. Protected Dashboard Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/transactions" element={<Transactions />} />
      </Routes>
    </Router>
  );
}

export default App;