import React, { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import type { MeResponse } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

import { LinkContainer } from "react-router-bootstrap";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

export default function NavBar() {
  const { logout, isAdmin } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);

  if (isAdmin) {
    return null;
  }

  useEffect(() => {
    getMe()
      .then(res => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  if (!me) {
    return null;
  }

  return (
    <Navbar bg="light" expand="lg" className="mb-3 border-bottom">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>E-Market</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="top-nav" />
        <Navbar.Collapse id="top-nav">
          <Nav className="me-auto">
            <LinkContainer to="/profile">
              <Nav.Link>Profile</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/profile/contacts">
              <Nav.Link>Contacts</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/profile/addresses">
              <Nav.Link>Addresses</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products">
              <Nav.Link>Ürünler</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/cart">
              <Nav.Link>Sepetim</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/orders">
              <Nav.Link>Siparişler</Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav className="ms-auto">
            <NavDropdown
              title={`${me.username} (${me.email})`}
              id="user-menu"
              align="end"
            >
              <NavDropdown.Item onClick={logout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
