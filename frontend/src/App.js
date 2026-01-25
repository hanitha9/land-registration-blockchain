import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AuthorityLogin from './pages/AuthorityLogin';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Profile from './pages/Profile';
import RegisterLand from './pages/RegisterLandNew';
import RegisterLandWithHistory from './pages/RegisterLandWithHistory';
import RegisterLandWithoutHistory from './pages/RegisterLandWithoutHistory';
import Payment from './pages/Payment';

// Protected Route Component for Users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Authority Route Component (no Navbar)
const AuthorityRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const authorityUser = JSON.parse(localStorage.getItem('authorityUser') || '{}');
  
  if (!token || authorityUser.role !== 'AUTHORITY') {
    return <Navigate to="/authority/login" />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Authority Routes - No Navbar */}
      <Route path="/authority/login" element={<AuthorityLogin />} />
      <Route path="/authority/dashboard" element={<AuthorityRoute><AuthorityDashboard /></AuthorityRoute>} />
      
      {/* User Routes - With Navbar */}
      <Route path="/*" element={
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={user ? <Navigate to="/profile" /> : <Signup />} />
            <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Register Land Routes */}
            <Route path="/register" element={<ProtectedRoute><RegisterLand /></ProtectedRoute>} />
            <Route path="/register-land" element={<ProtectedRoute><RegisterLand /></ProtectedRoute>} />
            <Route path="/register-land/with-history" element={<ProtectedRoute><RegisterLandWithHistory /></ProtectedRoute>} />
            <Route path="/register-land/without-history" element={<ProtectedRoute><RegisterLandWithoutHistory /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          </Routes>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;