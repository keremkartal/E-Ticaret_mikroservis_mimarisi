import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { cartService } from "../api/cartService";
import type { CartOut, CartItemOut } from "../api/cartService";
import { useNavigate } from "react-router-dom";    // ← ekledik

export default function CartPage() {
  const [cart, setCart]             = useState<CartOut | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const navigate = useNavigate();                  // ← burada tanımla

  // 1) reload artık async
  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await cartService.getCart();
      setCart(r.data);
      const q: Record<number, number> = {};
      r.data.items.forEach(i => {
        q[i.product_id] = i.quantity;
      });
      setQuantities(q);
    } catch {
      setError("Sepet yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  // 2) handleUpdate içinde await reload()
  const handleUpdate = async (item: CartItemOut) => {
    const newQty = quantities[item.product_id];
    if (newQty < 1) {
      alert("Adet en az 1 olmalı");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await cartService.updateItem(item.product_id, newQty);
      // sepete tekrar fetch at
      await reload();
    } catch {
      setError("Güncelleme başarısız");
      setLoading(false);
    }
  };

  const handleRemove = async (item: CartItemOut) => {
    if (!window.confirm(`"${item.product?.name || item.product_id}" sepetten silinsin mi?`)) return;
    setLoading(true);
    try {
      await cartService.removeItem(item.product_id);
      await reload();
    } catch {
      setError("Silme işlemi başarısız");
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Sepet tamamen temizlensin mi?")) return;
    setLoading(true);
    try {
      await cartService.clearCart();
      await reload();
    } catch {
      setError("Temizleme başarısız");
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="my-4">
      <h2>Sepetim</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {!cart || cart.items.length === 0 ? (
        <p>Sepetinizde ürün yok.</p>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Fiyat (₺)</th>
                <th>Adet</th>
                <th>Tutar (₺)</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => {
                const price = parseFloat(item.product?.price ?? "0");
                const qty   = quantities[item.product_id] ?? item.quantity;
                return (
                  <tr key={item.id}>
                    <td>{item.product?.name ?? item.product_id}</td>
                    <td>{price.toFixed(2)}</td>
                    <td style={{ maxWidth: 120 }}>
                      <InputGroup>
                        <FormControl
                          type="number"
                          min={1}
                          value={qty}
                          onChange={e =>
                            setQuantities({
                              ...quantities,
                              [item.product_id]: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </InputGroup>
                    </td>
                    <td>{(price * qty).toFixed(2)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleUpdate(item)}
                        className="me-2"
                        disabled={loading}
                      >
                        Güncelle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleRemove(item)}
                        disabled={loading}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between">
            <h5>
              Toplam:{" "}
              {cart.items
                .reduce((sum, item) => {
                  const price = parseFloat(item.product?.price ?? "0");
                  const qty   = quantities[item.product_id] ?? item.quantity;
                  return sum + price * qty;
                }, 0)
                .toFixed(2)}{" "}
              ₺
            </h5>
            {cart.items.length > 0 && (
              <Button variant="success" onClick={() => navigate("/checkout")}>
                Satın Al
              </Button>
            )}

            <Button variant="danger" onClick={handleClear} disabled={loading}>
              Sepeti Temizle
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
