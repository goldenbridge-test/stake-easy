import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Staking from './components/Staking';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import TradingDashboard from './components/TradingDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="bg-white min-h-screen font-body text-dark">
        <Routes>
          {/* Page d'accueil publique */}
          <Route path="/" element={<Home />} />

          {/* Auth routes (publiques) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Produits protégés */}
          <Route
            path="/staking"
            element={
              <ProtectedRoute>
                <Staking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arima"
            element={
              <ProtectedRoute>
                <TradingDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
