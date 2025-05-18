// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS'ini de import edin (gerekliyse)
import type { UserPayload } from "../auth/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, Form, Button, Alert } from 'react-bootstrap'; // Bu satırları ekleyin
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS'ini de import edin (gerekliyse)

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu eklendi

  const { login } = useAuth(); // isAdmin'a burada ihtiyacımız yok, payload'dan kontrol edeceğiz
  const navigate = useNavigate();
  const location = useLocation(); // Yönlendirme sonrası "from" state'i için

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Yükleme başladı

    try {
      const userPayload: UserPayload = await login(username, password);

      // YENİ: force_password_change bayrağını kontrol et
      if (userPayload.force_password_change === true) {
        // Kullanıcıyı şifre değiştirme sayfasına yönlendir
        // Şifre değiştirme sonrası nereye döneceğini state ile belirtebiliriz (opsiyonel)
        navigate("/password-change", { replace: true, state: { from: location.state?.from || "/" } });
      } else {
        // Şifre değişikliği gerekmiyorsa, rollere göre yönlendir
        const isAdmin = userPayload.roles?.includes("admin");
        const from = location.state?.from?.pathname || (isAdmin ? "/admin/dashboard" : "/");
        
        if (isAdmin) {
          navigate(from.startsWith("/admin") ? from : "/admin/dashboard", { replace: true });
        } else {
          navigate(from === "/login" ? "/" : from, { replace: true });
        }
      }
    } catch (err: any) {
      // AuthContext'teki login fonksiyonundan fırlatılan hataları yakala
      // Hata mesajları AuthContext'te daha spesifik hale getirilmişti.
      setError(err.message || "Giriş sırasında bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false); // Yükleme bitti
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }} // minHeight daha iyi olabilir
    >
      <Card style={{ width: "100%", maxWidth: 400 }}> {/* Card bileşeni eklendi */}
        <Card.Body>
          <h2 className="mb-4 text-center">Giriş Yap</h2> {/* Başlık güncellendi ve ortalandı */}
          {error && <Alert variant="danger">{error}</Alert>} {/* Alert bileşeni kullanıldı */}
          <Form onSubmit={handleSubmit}> {/* Form bileşeni kullanıldı */}
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text" // type eklendi
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Parola</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolanızı girin"
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Button variant="primary" className="w-100" type="submit" disabled={isLoading}>
              {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center mt-3"> {/* Link ortalandı */}
              <Link to="/forgot-password">Şifremi Unuttum?</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
