import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MpesaTransaction from './components/MpesaTransaction';
import RealMpesaTransaction from './components/RealMpesaTransaction';
import SavingsAccount from './components/SavingsAccount';
import MpesaCallbackHandler from './components/MpesaCallbackHandler';
import Navigation from './components/Navigation';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  return state.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigation />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Navigation />
            <MpesaTransaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/real-transactions"
        element={
          <ProtectedRoute>
            <Navigation />
            <RealMpesaTransaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/savings"
        element={
          <ProtectedRoute>
            <Navigation />
            <SavingsAccount />
          </ProtectedRoute>
        }
      />
      <Route path="/api/mpesa/callback" element={<MpesaCallbackHandler />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
