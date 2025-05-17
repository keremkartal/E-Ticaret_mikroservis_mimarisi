import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import React from "react";

 export default function AdminRoute({ children }: {children: React.ReactNode }) {
   const { token, isAdmin } = useAuth();
   if (!token) return <Navigate to="/login" replace />;
   if (!isAdmin) return <Navigate to="/" replace />;
   return children;
   return <>{children}</>;
 }