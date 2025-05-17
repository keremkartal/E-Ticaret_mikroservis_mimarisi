import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { userService} from "../api/userService";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "../api/userService";

export default function ForgotPassword() {
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [message, setMessage]     = useState<string | null>(null);
  const [variant, setVariant]     = useState<"info" | "success" | "danger">("info");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload: ForgotPasswordRequest = { username, email };
    try {
      const res = await userService.forgotPassword(payload);
      const data: ForgotPasswordResponse = res.data;

      if (data.temporary_password) {
        // must_change = 2 → geçici şifreyi göster
        setVariant("success");
        setMessage(`Şifreniz: ${data.temporary_password}`);
      } else {
        // must_change = 0 veya 1 → bilgi mesajı
        setVariant("info");
        setMessage(data.detail);
      }
    } catch (err: any) {
      setVariant("danger");
      setMessage(err.response?.data?.detail || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 500, width: "100%" }}>
        <Card.Body>
          <Card.Title className="mb-4">Şifremi Unuttum</Card.Title>
          
          {message && (
            <Alert variant={variant} onClose={() => setMessage(null)} dismissible>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="fpUsername">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="fpEmail">
              <Form.Label>E-Posta Adresi</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? "Gönderiliyor..." : "Şifreyi Sıfırlama Talebi Gönder"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
