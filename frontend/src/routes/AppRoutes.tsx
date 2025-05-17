import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"; // Outlet ve useLocation eklendi
import { useAuth } from "../auth/AuthContext";

// Sayfa Bileşenleri
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
import ChangePassword from "../pages/ChangePassword"; // Kullanıcının kendi isteğiyle şifre değiştirmesi için
import ForceChangePassword from "../pages/ForceChangePassword"; // Zorunlu şifre değiştirme için

// Layout Bileşenleri
import Layout from "../components/Layout"; // Layout bileşeninizin children prop'unu kabul ettiğini varsayıyoruz
import AdminLayout from "../pages/admin"; 

// Admin Route Kontrolü
import AdminRoute from "./AdminRoute";

// Protected route that checks authentication and forced password change
function PrivateRoute() {
  const { token, user } = useAuth(); // AuthState'ten token ve user bilgilerini al
  const location = useLocation(); // Mevcut konumu almak için

  if (!token || !user) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir,
    // mevcut konumu state olarak ileterek giriş sonrası geri dönülebilir.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Eğer kullanıcının şifresini değiştirmesi gerekiyorsa (must_change === 2)
  // ve şu anki yol /change-password (ForceChangePassword için olan) değilse,
  // zorunlu şifre değiştirme sayfasına yönlendir.
  if (user.must_change === 2 && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // Diğer durumlarda, Layout ile birlikte istenen route'u (Outlet aracılığıyla) render et
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Herkesin erişebileceği route'lar */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Bu /change-password yolu, kullanıcının must_change === 2 durumunda yönlendirileceği,
          zorunlu şifre değiştirme sayfasıdır. Genellikle layout olmadan gösterilir. */}
      <Route path="/change-password" element={<ForceChangePassword />} />

      {/* Korumalı (giriş yapılmış kullanıcı) route'lar */}
      {/* PrivateRoute artık Layout'u kendi içinde barındırıyor ve Outlet kullanıyor */}
      <Route element={<PrivateRoute />}>
        <Route index element={<Dashboard />} /> {/* Ana sayfa / dashboard */}
        <Route path="/" element={<Dashboard />} /> {/* index ile aynı, isteğe bağlı */}
        <Route path="profile" element={<Profile />} />
        <Route path="profile/contacts" element={<Contacts />} />
        <Route path="profile/addresses" element={<Addresses />} />
        {/* Kullanıcının kendi isteğiyle şifre değiştirmesi için farklı bir yol ve bileşen kullanılabilir,
            örneğin /profile/settings/change-password gibi.
            Eğer ChangePassword bileşeni bu amaçla kullanılacaksa, buraya eklenebilir.
            Şimdilik, ForceChangePassword ile çakışmaması için yorumda bırakıyorum.
            Eğer /change-password yolunu hem zorunlu hem de isteğe bağlı değişim için kullanacaksanız,
            ForceChangePassword bileşeni içinde bu iki durumu ayırt edecek bir mantık olmalı.
        */}
        {/* <Route path="settings/change-password" element={<ChangePassword />} /> */}
        
        <Route path="products" element={<ProductsList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />

        {/* Admin route'ları */}
        <Route
          path="admin/*" // admin altındaki tüm yolları kapsar
          element={
            <AdminRoute> {/* Admin yetkisi kontrolü */}
              {/* AdminLayout kendi içinde Outlet kullanarak admin sayfalarını yönetir */}
              <AdminLayout /> 
            </AdminRoute>
          }
        />
      </Route>

      {/* Bulunamayan yollar için ana sayfaya yönlendirme (isteğe bağlı) */}
      {/* Bu genellikle en sona konur */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
