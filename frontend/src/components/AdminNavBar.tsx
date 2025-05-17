
import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { getMe } from "../api/auth";
import type { MeResponse } from "../api/auth";

export default function AdminNavBar() {
  const { logout } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    getMe()
      .then(res => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand>Admin Panel</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-nav" />
        <Navbar.Collapse id="admin-nav">
          <Nav className="me-auto">
            <LinkContainer to="/admin/users">
              <Nav.Link>Users</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/password-requests">
              <Nav.Link>Şifre Unutanlar</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/products">
              <Nav.Link>Products</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/profile">
              <Nav.Link>Profile</Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav className="ms-auto">
            {me && (
              <NavDropdown
                title={`${me.username} (${me.email})`}
                id="admin-user-menu"
                align="end"
              >
                <NavDropdown.Item onClick={logout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
