import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import type { OrderOut } from "../api/orderService";
import { orderService } from "../api/orderService";
import { useParams } from "react-router-dom";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderOut | null>(null);
  const [orderNo, setOrderNo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Geçersiz sipariş ID");
      setLoading(false);
      return;
    }

    // 1) Tüm siparişleri alıp bu ID'nin hangi sırada olduğunu bul
    orderService.listOrders()
      .then(r => {
        const list = r.data;
        const idx = list.findIndex(o => o.id === +id);
        if (idx >= 0) setOrderNo(idx + 1);
      })
      .catch(() => {
        /* hata olur ise ses çıkarmayalım */
      });

    // 2) Sipariş detayını al
    orderService.getOrder(+id)
      .then(r => setOrder(r.data))
      .catch(() => setError("Sipariş bulunamadı"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="my-4">
      <h2>Sipariş #{orderNo ?? order?.id}</h2>
      <Card className="mb-4">
        <Card.Body>
          <p><strong>Tarih:</strong> {new Date(order!.created_at).toLocaleString()}</p>
          <p><strong>Durum:</strong> {order!.status}</p>
          <p><strong>Gönderim Adresi:</strong> {order!.street}, {order!.city}</p>
          <p><strong>Ülke/PK:</strong> {order!.country} / {order!.postal_code}</p>
        </Card.Body>
      </Card>

      <h4>Ürünler</h4>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Birim Fiyat (₺)</th>
            <th>Tutar (₺)</th>
          </tr>
        </thead>
        <tbody>
          {order!.items.map(i => {
            const price = parseFloat(i.price_at_order);
            return (
              <tr key={i.id}>
                <td>{i.product?.name ?? i.product_id}</td>
                <td>{i.quantity}</td>
                <td>{price.toFixed(2)}</td>
                <td>{(price * i.quantity).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}
