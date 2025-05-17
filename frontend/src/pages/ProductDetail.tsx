import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Spinner, Alert, Button } from "react-bootstrap";
import { productService } from "../api/productService";
import type { ProductOut } from "../api/productService";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [product, setProduct] = useState<ProductOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Geçersiz ürün ID");
      setLoading(false);
      return;
    }
    productService
      .getProduct(+id)
      .then(r => setProduct(r.data))
      .catch(err => {
        setError(err.response?.data?.detail || "Ürün bulunamadı");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (error)   return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="my-4">
      <Button variant="secondary" size="sm" onClick={() => nav(-1)}>
        ← Geri
      </Button>
      <Card className="mt-3">
        <Card.Header>
          <h3>{product?.name}</h3>
        </Card.Header>
        <Card.Body>
          <p><strong>Açıklama:</strong> {product?.description || "Yok"}</p>
          <p><strong>Fiyat:</strong> {product && parseFloat(product.price).toFixed(2)} ₺</p>
          <p><strong>Stok:</strong> {product?.stock}</p>
          <p><strong>Görünür:</strong> {product?.is_visible ? "Evet" : "Hayır"}</p>
<p>
            <strong>Kategori:</strong>{" "}
            {product?.category?.name ?? "–"}
          </p>        </Card.Body>
      </Card>
    </Container>
  );
}
