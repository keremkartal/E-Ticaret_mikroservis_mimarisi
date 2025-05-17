import React, { useEffect, useState } from "react";
import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import AddressForm from "../components/AddressForm";
import NavBar from "../components/NavBar";
import { userService } from "../api/userService";
import { type AddressSchema  } from "../api/userService";
export default function Addresses() {
  const [addresses, setAddresses] = useState<AddressSchema[]>([]);
  const [editing, setEditing]     = useState<AddressSchema | null>(null);

  const reload = () => userService.getAddresses().then(r => setAddresses(r.data));
useEffect(() => {
  reload();
}, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this address?")) {
      await userService.deleteAddress(id);
      reload();
    }
  };




  
  return (
    <>
      <Container>
        <h2 className="mt-4">My Addresses</h2>

        <ListGroup className="mb-4">
          {addresses.map(a => (
            <ListGroup.Item key={a.id}>
              <Row className="align-items-center">
                <Col>
                  <strong>[{a.category}]</strong> {a.street}, {a.city}, {a.country} — {a.postal_code}
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setEditing(a)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <h3>{editing ? "Edit Address" : "Add New Address"}</h3>
        <AddressForm
          initialData={editing ?? undefined}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      </Container>
    </>
  );
}
