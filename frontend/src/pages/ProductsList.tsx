// frontend/src/pages/ProductsList.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Alert,
  Button,
  Container,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { productService } from "../api/productService";
import type {  ProductOut } from "../api/productService";

import { cartService } from "../api/cartService";

export default function ProductsList() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    productService
      .listProducts()
      .then(r => setProducts(r.data))
      .catch(err => {
        setError(err.response?.data?.detail || "Ürünler yüklenemedi");
      })
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);
// src/pages/ProductsList.tsx

const handleAddToCart = async (p: ProductOut) => {
  if (p.stock < 1) {
    setToastMsg(`"${p.name}" stokta yok.`);
    return;
  }

  // Kullanıcıdan adet iste
  const input = window.prompt(
    `"${p.name}" için kaç adet eklemek istiyorsunuz? (Maks ${p.stock})`,
    "1"
  );
  if (!input) return;

  const qty = parseInt(input, 10);
  if (isNaN(qty) || qty < 1) {
    setToastMsg("Geçersiz adet girdiniz.");
    return;
  }
  if (qty > p.stock) {
    setToastMsg(`Maksimum stok: ${p.stock}`);
    return;
  }

  setAddingId(p.id);
  try {
    await cartService.addItem(p.id, qty);
    setToastMsg(`"${p.name}" sepete eklendi (${qty} adet).`);
  } catch (err: any) {
    const det = err.response?.data?.detail;
    const msg =
      typeof det === "string"
        ? det
        : Array.isArray(det)
        ? det.map(d => d.msg).join(", ")
        : "Sepete ekleme başarısız.";
    setToastMsg(msg);
  } finally {
    setAddingId(null);
  }
};


  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="my-4">
      <h2 className="mb-4">Ürünler</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Görünür</th>
            <th>Detay</th>
            <th>Sepete Ekle</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{parseFloat(p.price).toFixed(2)} ₺</td>
              <td>{p.stock}</td>
              <td>{p.is_visible ? "Evet" : "Hayır"}</td>
              <td>
                <LinkContainer to={`/products/${p.id}`}>
                  <Button size="sm" variant="primary">
                    Görüntüle
                  </Button>
                </LinkContainer>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="success"
                  disabled={addingId === p.id}
                  onClick={() => handleAddToCart(p)}
                >
                  {addingId === p.id ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    "Sepete Ekle"
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Kullanıcıya kısa bildirim göstermek için Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        {toastMsg && (
          <Toast
            bg="info"
            onClose={() => setToastMsg(null)}
            delay={3000}
            autohide
          >
            <Toast.Body>{toastMsg}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </Container>
  );
}
