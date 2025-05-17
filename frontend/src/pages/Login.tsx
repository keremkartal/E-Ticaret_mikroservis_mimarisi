// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext"; // UserPayload'ı da import et
import type  {  UserPayload } from "../auth/AuthContext"; // UserPayload'ı da import et

import { useNavigate, Link } from "react-router-dom";
// userService.getMe() çağrısı artık burada gerekli değil, bilgiler payload'dan gelecek.
// import { userService } from "../api/userService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // isAdmin'ı doğrudan AuthContext'ten alıyoruz, login sonrası güncellenecektir.
  const { login, isAdmin } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // AuthContext'teki login fonksiyonu UserPayload döndürecek
      const userPayload: UserPayload = await login(username, password);
      
      // Yönlendirme mantığı payload'daki bilgilere göre yapılır
      if (userPayload.must_change === 2) {
        alert("Geçici şifrenizle giriş yaptınız. Lütfen şifrenizi güncelleyin.");
        navigate("/change-password"); // Şifre değiştirme sayfasının yolu
      } else {
        // isAdmin, AuthContext'teki user state'i güncellendikten sonra doğru değeri alacaktır.
        // Alternatif olarak, doğrudan userPayload.roles kullanılabilir.
        const isActuallyAdmin = userPayload.roles?.includes("admin");
        if (isActuallyAdmin) { // veya isAdmin (bir sonraki render'da güncellenir)
          navigate("/admin/dashboard"); // Admin paneline yönlendir
        } else {
          navigate("/"); // Ana sayfaya yönlendir
        }
      }
    } catch (err: any) {
      // AuthContext'teki login fonksiyonundan fırlatılan hataları yakala
      if (err.message === "AccountInactive") {
        setError("Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.");
      } else {
        setError(err.message || "Giriş sırasında bilinmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "80vh" }}
    >
      <form onSubmit={handleSubmit} style={{ width: 300 }}>
        <h2 className="mb-3">Giriş Yap</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <input
          className="form-control mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Kullanıcı Adı"
          required
        />
        <input
          className="form-control mb-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parola"
          required
        />
        <button className="btn btn-primary w-100" type="submit">
          Giriş Yap
        </button>
        <div className="text-end mt-2">
          <Link to="/forgot-password">Şifremi Unuttum?</Link>
        </div>
      </form>
    </div>
  );
}
