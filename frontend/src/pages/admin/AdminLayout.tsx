import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AdminNavBar from "../../components/AdminNavBar";

export default function AdminLayout() {
  return (
    <>
      <AdminNavBar />
      <Container fluid className="mt-3">
        <Outlet />
      </Container>
    </>
  );
}
