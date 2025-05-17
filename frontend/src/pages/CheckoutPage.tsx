import React, { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import { cartService } from "../api/cartService";
import type { OrderCreate, OrderOut } from "../api/orderService";

import { orderService, } from "../api/orderService";
import { userService } from "../api/userService";
import type { AddressSchema } from "../api/userService";
import { useNavigate } from "react-router-dom";
import type { CartOut } from "../api/cartService";  // ← ekledik
export default function CheckoutPage() {
  const [cart, setCart] = useState<CartOut | null>(null);
  const [addresses, setAddresses] = useState<AddressSchema[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  // Yükle: sepet + adresler
  useEffect(() => {
    setLoading(true);
    Promise.all([cartService.getCart(), userService.getAddresses()])
      .then(([c, a]) => {
        setCart(c.data);
        setAddresses(a.data);
      })
      .catch(() => setError("Veriler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const handleOrder = async () => {
    if (!selectedAddr) {
      setError("Lütfen bir adres seçin");
      return;
    }
    setPlacing(true);
    try {
      const payload: OrderCreate = { address_id: selectedAddr as number };
      const res = await orderService.placeOrder(payload);
      const ord: OrderOut = res.data;
      navigate(`/orders/${ord.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sipariş verilemedi");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="my-4">
      <h2>Ödeme & Adres Seçimi</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Adres seçimi */}
      <Form.Group className="mb-4">
        <Form.Label>Gönderim Adresiniz</Form.Label>
        <Form.Select
          value={selectedAddr}
          onChange={e =>
            setSelectedAddr(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        >
          <option value="">— Lütfen seçin —</option>
          {addresses.map(addr => (
            <option key={addr.id} value={addr.id}>
              [{addr.category}] {addr.street}, {addr.city}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Sepet özeti */}
      <h4>Sepetiniz</h4>
      {!cart || cart.items.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <Table bordered hover responsive className="mb-4">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Adet</th>
              <th>Birim Fiyat (₺)</th>
              <th>Tutar (₺)</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map(i => {
              const price = parseFloat(i.product?.price ?? "0");
              const qty = i.quantity;
              return (
                <tr key={i.id}>
                  <td>{i.product?.name ?? i.product_id}</td>
                  <td>{qty}</td>
                  <td>{price.toFixed(2)}</td>
                  <td>{(price * qty).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>Toplam</strong></td>
              <td>
                <strong>
                  {cart.items
                    .reduce((sum, i) => {
                      const price = parseFloat(i.product?.price ?? "0");
                      return sum + price * i.quantity;
                    }, 0)
                    .toFixed(2)}{" "}
                  ₺
                </strong>
              </td>
            </tr>
          </tfoot>
        </Table>
      )}

      <Button
        variant="success"
        onClick={handleOrder}
        disabled={placing || !cart || cart.items.length === 0}
      >
        {placing ? <Spinner animation="border" size="sm" /> : "Siparişi Onayla"}
      </Button>
    </Container>
  );
}
