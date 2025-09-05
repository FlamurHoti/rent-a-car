import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import MarketplaceLayout from './components/layout/MarketplaceLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import Cars from './pages/admin/Cars';
import CarForm from './pages/admin/CarForm';
import Reservations from './pages/admin/Reservations';
import ReservationForm from './pages/admin/ReservationForm';
import Company from './pages/admin/Company';
import Payments from './pages/admin/Payments';
import Marketplace from './pages/marketplace/Marketplace';
import CompanyCatalog from './pages/marketplace/CompanyCatalog';
import BookCar from './pages/marketplace/BookCar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/marketplace" element={<MarketplaceLayout />}>
        <Route index element={<Marketplace />} />
        <Route path=":companyId" element={<CompanyCatalog />} />
        <Route path=":companyId/cars/:carId/book" element={<BookCar />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cars" element={<Cars />} />
        <Route path="cars/new" element={<CarForm />} />
        <Route path="cars/:id/edit" element={<CarForm />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="reservations/new" element={<ReservationForm />} />
        <Route path="reservations/:id/edit" element={<ReservationForm />} />
        <Route path="company" element={<Company />} />
        <Route path="payments" element={<Payments />} />
      </Route>
      <Route path="*" element={<Navigate to="/marketplace" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
