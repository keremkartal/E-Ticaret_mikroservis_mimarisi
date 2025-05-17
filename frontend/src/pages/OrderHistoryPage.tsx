import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { orderService } from "../api/orderService";
import { useNavigate } from "react-router-dom";
import type { OrderOut } from "../api/orderService";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.listOrders()
      .then(r => setOrders(r.data))
      .catch(() => setError("Siparişler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="my-4">
      <h2>Sipariş Geçmişi</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <p>Henüz siparişiniz yok.</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>No</th>
              <th>Tarih</th>
              <th>Toplam (₺)</th>
              <th>Durum</th>
              <th>Detay</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o.id}>
                {/* Kullanıcının kendi sıralı numarası */}
                <td>{idx + 1}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>{parseFloat(o.total_amount).toFixed(2)}</td>
                <td>{o.status}</td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/orders/${o.id}`)}
                  >
                    Görüntüle
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
