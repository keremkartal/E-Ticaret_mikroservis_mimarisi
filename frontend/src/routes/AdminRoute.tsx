import React from "react"; 
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; 

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin, isLoading } = useAuth(); 

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Yetki kontrol ediliyor...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>; 
}
