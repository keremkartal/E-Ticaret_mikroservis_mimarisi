import React, { useEffect, useState } from "react";
import { Table, Button, Container, Alert, Spinner } from "react-bootstrap";
import { adminService } from "../../api/userService";
import type { ForgotPasswordResponse } from "../../api/userService";

import type { UserOut } from "../../api/userService";

export default function PasswordRequests() {
  const [requests, setRequests] = useState<UserOut[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    adminService
      .listPasswordRequests()
      .then(r => setRequests(r.data))
      .catch(err =>
        setError(err.response?.data?.detail || "Liste yüklenemedi")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const handleReset = async (u: UserOut) => {
    if (!window.confirm(`${u.username} için şifre sıfırlansın mı?`)) return;
    try {
      const res = await adminService.resetUserPassword(u.id);
      const data = res.data as ForgotPasswordResponse;
      alert(`Yeni geçici şifre: ${data.temporary_password}`);
      // Sıfırlanan kullanıcı artık must_change=2 olduğu için listeden düşecektir
      reload();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Şifre sıfırlama başarısız");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container>
      <h2 className="mb-4">Şifre Unutanlar</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {requests.length === 0 ? (
        <p>Şu anda bekleyen şifre sıfırlama talebi yok.</p>
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı Adı</th>
              <th>E-Posta</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleReset(u)}
                  >
                    Şifreyi Sıfırla
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
