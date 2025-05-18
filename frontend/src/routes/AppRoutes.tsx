import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Contacts from "../pages/Contacts";
import Addresses from "../pages/Addresses";
import ProductsList from "../pages/ProductsList";
import ProductDetail from "../pages/ProductDetail";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import ChangePassword from "../pages/ChangePassword";
import PasswordChangePage from "../pages/PasswordChangePage.tsx";
import Layout from "../components/Layout";
import AdminLayout from "../pages/admin";
import AdminRoute from "./AdminRoute";

function ProtectedRoutesLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.force_password_change && location.pathname !== "/password-change") {
    console.log("AppRoutes: force_password_change true, /password-change yönlendiriliyor.");
    return <Navigate to="/password-change" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function AppRoutes() {
  const { token, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/" replace />} />

      <Route 
        path="/password-change" 
        element={
          token ? <PasswordChangePage /> : <Navigate to="/login" state={{ from: {pathname: "/password-change"} }} replace />
        } 
      />

      <Route element={token ? <ProtectedRoutesLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/contacts" element={<Contacts />} />
        <Route path="profile/addresses" element={<Addresses />} />
        
        <Route path="products" element={<ProductsList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
      </Route>

      <Route
        path="admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      />
      
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}