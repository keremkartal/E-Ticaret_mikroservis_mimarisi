// frontend/src/pages/ChangePassword.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService } from "../api/userService";
import type { PasswordChange } from "../api/userService";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, logout } = useAuth(); // Kullanıcı bilgisini al
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // must_change=2 ise old_password gönderme
      const payload = user?.must_change === 2 
        ? { new_password: newPassword }
        : { old_password: oldPassword, new_password: newPassword };
      
      await userService.changePassword(payload as PasswordChange);
      setSuccess("Şifreniz güncellendi. Tekrar giriş yapın.");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Bir hata oluştu");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
      <form onSubmit={handleSubmit} style={{ width: 300 }}>
        <h2 className="mb-3">Şifre Değiştir</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {/* must_change=2 değilse eski şifre alanını göster */}
        {user?.must_change !== 2 && (
          <input
            className="form-control mb-2"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Eski Şifreniz"
            required
          />
        )}
        
        <input
          className="form-control mb-2"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Yeni Şifre"
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Şifreyi Değiştir
        </button>
      </form>
    </div>
  );
}