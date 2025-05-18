// frontend/src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom"; // Link eklendi
import { userService } from "../api/userService";
// UserForgotPasswordResponse'u userService'den import ediyoruz
import type { ForgotPasswordRequest, UserForgotPasswordResponse } from "../api/userService";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"info" | "success" | "danger">("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setVariant("info"); // Başlangıç varyantı

    const payload: ForgotPasswordRequest = { username, email };
    try {
      // userService'deki forgotPassword fonksiyonu artık UserForgotPasswordResponse döndürüyor
      const response = await userService.forgotPassword(payload);
      // Axios'tan gelen data objesini doğrudan kullanıyoruz
      const data: UserForgotPasswordResponse = response.data;

      // Backend artık bu endpoint'te geçici şifre DÖNDÜRMÜYOR.
      // Sadece bir onay mesajı veriyor.
      // if (data.temporary_password) { ... } bloğu kaldırıldı.

      setVariant("success"); // Başarılı talep için success varyantı
      setMessage(data.detail); // Backend'den gelen mesajı göster
      setUsername(""); // Formu temizle
      setEmail("");    // Formu temizle

    } catch (err: any) {
      setVariant("danger");
      setMessage(err.response?.data?.detail || "Şifre sıfırlama talebi gönderilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 500, width: "100%" }}>
        <Card.Body>
          <Card.Title className="mb-4 text-center">Şifremi Unuttum</Card.Title>
          
          {message && (
            <Alert variant={variant} onClose={() => setMessage(null)} dismissible={variant !== 'success'}>
              {message}
            </Alert>
          )}

          {/* Başarılı mesajı gösterildiğinde formu gizleyebiliriz veya sadece inputları temizleyebiliriz */}
          {/* Şimdilik formu her zaman gösteriyoruz, kullanıcı yeni bir talep gönderebilir. */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="fpUsername">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Kayıtlı kullanıcı adınız"
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="fpEmail">
              <Form.Label>E-Posta Adresi</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Kayıtlı e-posta adresiniz"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100 mb-3">
              {loading ? "Gönderiliyor..." : "Sıfırlama Talebi Gönder"}
            </Button>
            <div className="text-center">
              <Link to="/login">Giriş Sayfasına Dön</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
