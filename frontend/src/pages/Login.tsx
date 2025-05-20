// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import type { UserPayload } from "../auth/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userPayload: UserPayload = await login(username, password);

      if (userPayload.force_password_change) {
        navigate("/password-change", { replace: true, state: { from: location.state?.from || "/" } });
      } else {
        const isAdmin = userPayload.roles?.includes("admin");
        const from = location.state?.from?.pathname || (isAdmin ? "/admin/dashboard" : "/");
        if (isAdmin) {
          navigate(from.startsWith("/admin") ? from : "/admin/dashboard", { replace: true });
        } else {
          navigate(from === "/login" ? "/" : from, { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message || "Giriş sırasında bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <Card.Body>
          <h2 className="mb-4 text-center">Giriş Yap</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
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
            <div className="text-center mt-3">
              <Link to="/forgot-password">Şifremi Unuttum?</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
