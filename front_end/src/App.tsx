import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Staking from './components/Staking';
import Home from './components/Home';
import TradingDashboard from './components/TradingDashboard';
import ArimaBacktest from './components/ArimaBacktest';
import ArimaPortfolio from './components/ArimaPortfolio';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="bg-white min-h-screen font-body text-dark">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/staking" element={<ProtectedRoute><Staking /></ProtectedRoute>} />

          <Route path="/arima" element={<ProtectedRoute><TradingDashboard /></ProtectedRoute>} />
          <Route path="/arima/backtest" element={<ProtectedRoute><ArimaBacktest /></ProtectedRoute>} />
          <Route path="/arima/portfolio" element={<ProtectedRoute><ArimaPortfolio /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
