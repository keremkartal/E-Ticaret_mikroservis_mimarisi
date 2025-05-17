// frontend/src/components/Layout.tsx
import Reac from "react"; // ReactNode import edildi
import type { ReactNode } from "react";

import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import NavBar from "./NavBar"; // NavBar bileşeninizin var olduğunu varsayıyoruz
import AdminNavBar from "./AdminNavBar"; // AdminNavBar bileşeninizin var olduğunu varsayıyoruz

// Layout bileşeninin alacağı props'ları tanımlayan interface
interface LayoutProps {
  children: ReactNode; // children prop'u ReactNode tipinde olmalı
}

// Layout bileşeni artık React.FC<LayoutProps> tipinde ve children prop'unu alıyor
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Admin paneli yolları (/admin ile başlayanlar):
  // Bu durumda, Layout sadece kendisine geçirilen çocukları (AppRoutes'taki Outlet'i) render eder.
  // Bu, /admin altındaki sayfaların (muhtemelen AdminLayout tarafından yönetilen)
  // kendi navigasyonunu veya yapısını tamamen kendilerinin yöneteceği anlamına gelir.
  if (location.pathname.startsWith("/admin")) {
    return <>{children}</>; // AppRoutes'tan gelen <Outlet />'i render et
  }

  // Admin olmayan veya /admin ile başlamayan diğer tüm korumalı yollar:
  // Uygun navigasyon barını göster ve ardından çocukları (AppRoutes'taki Outlet'i) render et.
  return (
    <>
      {isAdmin ? <AdminNavBar /> : <NavBar />}
      <main style={{ paddingTop: '20px', paddingBottom: '20px', margin: '0 20px' }}> {/* İçeriğe biraz padding eklendi */}
        {children} {/* AppRoutes'tan gelen <Outlet />'i render et */}
      </main>
      {/* İsteğe bağlı olarak bir Footer eklenebilir */}
      {/* <footer>Footer Alanı</footer> */}
    </>
  );
};

export default Layout;
