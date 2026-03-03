import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboards
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import RevenueOfficerDashboard from './pages/dashboards/RevenueOfficerDashboard';
import BankManagerDashboard from './pages/dashboards/BankManagerDashboard';
import SubRegistrarDashboard from './pages/dashboards/SubRegistrarDashboard';

// Land Management
import RequestLandRegistration from './pages/land/RequestLandRegistration';
import ApplyLoan from './pages/land/ApplyLoan';
import InitiateSale from './pages/land/InitiateSale';
import LandDetail from './pages/land/LandDetail';

// Revenue Officer Pages
import ViewAllLands from './pages/land/ViewAllLands';
import ManageDisputes from './pages/land/ManageDisputes';

// Sub-Registrar Pages
import TransferReview from './pages/land/TransferReview';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            } />

            {/* Role-specific Dashboards */}
            <Route path="/revenue-dashboard" element={
              <ProtectedRoute allowedRoles={['revenue_officer', 'admin']}>
                <RevenueOfficerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/bank-dashboard" element={
              <ProtectedRoute allowedRoles={['bank_manager']}>
                <BankManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/registrar-dashboard" element={
              <ProtectedRoute allowedRoles={['sub_registrar']}>
                <SubRegistrarDashboard />
              </ProtectedRoute>
            } />

            {/* Land Management */}
            <Route path="/request-land-registration" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <RequestLandRegistration />
              </ProtectedRoute>
            } />

            <Route path="/apply-loan" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ApplyLoan />
              </ProtectedRoute>
            } />

            <Route path="/initiate-sale" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <InitiateSale />
              </ProtectedRoute>
            } />

            {/* Land Detail — accessible by all roles */}
            <Route path="/land/:landId" element={
              <ProtectedRoute>
                <LandDetail />
              </ProtectedRoute>
            } />

            {/* Revenue Officer Pages */}
            <Route path="/view-all-lands" element={
              <ProtectedRoute allowedRoles={['revenue_officer', 'admin']}>
                <ViewAllLands />
              </ProtectedRoute>
            } />

            <Route path="/manage-disputes" element={
              <ProtectedRoute allowedRoles={['revenue_officer', 'admin']}>
                <ManageDisputes />
              </ProtectedRoute>
            } />

            {/* Sub-Registrar Pages */}
            <Route path="/review-transfer/:transferId" element={
              <ProtectedRoute allowedRoles={['sub_registrar', 'admin']}>
                <TransferReview />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;