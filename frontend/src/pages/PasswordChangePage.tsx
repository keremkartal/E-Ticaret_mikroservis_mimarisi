// frontend/src/pages/PasswordChangePage.tsx
import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { userService } from "../api/userService";
import type { PasswordChange } from "../api/userService";

export default function PasswordChangePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isForcedChange = user?.force_password_change === true;

  useEffect(() => {
    if (successMessage) {
      // Başarılı mesajı gösterildikten bir süre sonra logout yap ve login'e yönlendir.
      const timer = setTimeout(() => {
        logout(); // Bu, AuthContext'te tanımlandığı gibi /login'e yönlendirecektir.
      }, 3000); // 3 saniye bekle
      return () => clearTimeout(timer);
    }
  }, [successMessage, logout, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 8) { // Örnek bir kural, backend ile aynı olmalı
      setError("Yeni şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (isForcedChange && oldPassword === newPassword) {
        setError("Yeni şifreniz geçici şifrenizle (e-posta adresinizle) aynı olamaz.");
        return;
    }
    if (!isForcedChange && oldPassword === newPassword) {
        setError("Yeni şifreniz eski şifrenizle aynı olamaz.");
        return;
    }


    setIsLoading(true);
    const payload: PasswordChange = {
      old_password: oldPassword,
      new_password: newPassword,
    };

    try {
      await userService.changePassword(payload);
      setSuccessMessage(
        "Şifreniz başarıyla değiştirildi. Güvenliğiniz için tekrar giriş yapmanız gerekmektedir. Şimdi giriş sayfasına yönlendirileceksiniz..."
      );
      // useEffect yukarıda logout'u tetikleyecek
    } catch (err: any) {
      setError(err.response?.data?.detail || "Şifre değiştirilirken bir hata oluştu. Lütfen girdiğiniz bilgileri kontrol edin veya daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  
  if (!user) {
    navigate("/login", { replace: true });
    return null; 
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 500, width: "100%" }}>
        <Card.Body>
          <Card.Title className="mb-4">
            {isForcedChange ? "Yeni Şifre Oluşturun" : "Şifre Değiştir"}
          </Card.Title>

          {isForcedChange && (
            <Alert variant="info">
              Güvenliğiniz için şifrenizi değiştirmeniz gerekmektedir. Lütfen
              "Mevcut Şifre" alanına size yönetici tarafından atanan geçici şifrenizi (e-posta adresiniz)
              giriniz ve ardından yeni bir şifre belirleyiniz.
            </Alert>
          )}

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success">{successMessage}</Alert>
          )}

          {!successMessage && ( // Şifre başarıyla değiştiyse formu tekrar gösterme
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="oldPassword">
                <Form.Label>Mevcut Şifre</Form.Label>
                <Form.Control
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={isForcedChange ? "E-posta adresinizi girin" : "Mevcut şifreniz"}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>Yeni Şifre</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmNewPassword">
                <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
                {isLoading ? "İşleniyor..." : (isForcedChange ? "Yeni Şifreyi Kaydet" : "Şifreyi Değiştir")}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
