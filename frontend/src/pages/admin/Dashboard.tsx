import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaShoppingCart, FaBoxOpen, FaChartLine, FaCog } from "react-icons/fa";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: "Toplam Kullanıcı", icon: <FaUsers size={32} />, value: 13 },
    { title: "Toplam Ürün", icon: <FaBoxOpen size={32} />, value: 16 },
    { title: "Aktif Sepet", icon: <FaShoppingCart size={32} />, value: 12 },
    { title: "Günlük Satış", icon: <FaChartLine size={32} />, value: 78 },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Hoş geldiniz, {user?.sub}!</h2>
      <Row className="g-4">
        {stats.map((stat, idx) => (
          <Col key={idx} xs={12} md={6} lg={3}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body className="d-flex flex-column justify-content-center">
                <div className="mb-3 text-primary">{stat.icon}</div>
                <Card.Title>{stat.value}</Card.Title>
                <Card.Text>{stat.title}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="mt-5 text-center">
        <Button variant="primary" className="me-2" onClick={() => navigate('/admin/users')}>
          Kullanıcıları Yönet
        </Button>
        <Button variant="success" className="me-2" onClick={() => navigate('/admin/products')}>
          Ürünleri Yönet
        </Button>
        <Button variant="warning" onClick={() => navigate('/admin/password-requests')}>
          Şifre Talepleri
        </Button>
      </div>
    </Container>
  );
}
