import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import UsersList from "./UsersList";
import PasswordRequests from "./PasswordRequests";
import AdminProductsList from "./AdminProductsList";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="products" element={<AdminProductsList />} />

       <Route
         path="password-requests"
         element={<PasswordRequests />}
       />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
