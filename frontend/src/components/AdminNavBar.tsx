import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../auth/AuthContext";

export default function AdminNavBar() {
  const { logout, user } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <LinkContainer to="/admin">
          <Navbar.Brand>Admin Paneli</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/admin/dashboard">
              <Nav.Link>Gösterge Paneli</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/users">
              <Nav.Link>Kullanıcılar</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/roles">
              <Nav.Link>Rol Yönetimi</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/products">
              <Nav.Link>Ürünler</Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav className="ms-auto">
            {user && (
              <NavDropdown
                title={`Merhaba, ${user.sub}`}
                id="admin-user-menu"
                align="end"
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item>Profilim (Admin)</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>
                  Çıkış Yap
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
