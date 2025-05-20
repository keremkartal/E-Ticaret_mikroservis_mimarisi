import Reac from "react";
import type { ReactNode } from "react";

import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import NavBar from "./NavBar";
import AdminNavBar from "./AdminNavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {isAdmin ? <AdminNavBar /> : <NavBar />}
      <main style={{ paddingTop: '20px', paddingBottom: '20px', margin: '0 20px' }}>
        {children}
      </main>
    </>
  );
};

export default Layout;
