import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RefreshProvider } from './context/RefreshContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import HabitMonitor from './pages/HabitMonitor';
import Schedule from './pages/Schedule';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Verifying session...</span>
      </div>
    );
  }

  return user ? (
    <DashboardLayout>{children}</DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
        <RefreshProvider>
        <Routes>
          {/* Public SaaS Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure SaaS Protected Dashboards */}
          <Route 
            path="/today" 
            element={
              <PrivateRoute>
                <HabitMonitor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <PrivateRoute>
                <Schedule />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </RefreshProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
