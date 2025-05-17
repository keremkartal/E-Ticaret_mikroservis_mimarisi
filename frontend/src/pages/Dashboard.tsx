import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { productService, type ProductOut } from "../api/productService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<ProductOut[]>([]);

  useEffect(() => {
    // En yeni 4 ürünü çeker
    productService.listProducts(0, 4)
      .then(res => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <Container className="my-4">
      <h2 className="mb-4">Hoş geldiniz, {user?.sub}!</h2>

      {/* Hızlı Erişim Kartları */}
      <Row className="g-4 mb-5">
        <Col xs={12} md={4}>
          <Card
            className="h-100 text-center"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title>Profilim</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card
            className="h-100 text-center"
            onClick={() => navigate("/orders")}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title>Siparişlerim</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card
            className="h-100 text-center"
            onClick={() => navigate("/cart")}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Title>Sepetim</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Öne Çıkan Ürünler */}
      <h4 className="mb-3">Öne Çıkan Ürünler</h4>
      <Row className="g-4">
        {featured.map(product => (
          <Col key={product.id} xs={12} sm={6} md={3}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="flex-grow-1">{product.name}</Card.Title>
                <Card.Text className="mb-4">
                  {product.description?.slice(0, 50) || "Açıklama yok"}...
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span><strong>{parseFloat(product.price).toFixed(2)} ₺</strong></span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    İncele
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
