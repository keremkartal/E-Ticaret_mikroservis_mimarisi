import React, { useEffect, useState } from "react";
import { listContacts } from "../api/contacts";
import type { Contact } from "../api/contacts";
import ContactForm from "../components/ContactForm";
import NavBar from "../components/NavBar";

import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import { userService } from "../api/userService";
import type { ContactSchema } from "../api/userService";
export default function Contacts() {
  const [contacts, setContacts] = useState<ContactSchema[]>([]);
  const [editing, setEditing]   = useState<ContactSchema | null>(null);

  const reload = () => userService.getContacts().then(r => setContacts(r.data));
useEffect(() => {
  reload();
}, []);
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure to delete this contact?")) {
      await userService.deleteContact(id);
      reload();
    }
  };

  return (
    <>
      <Container>
        <h2 className="mt-4">My Contacts</h2>

        <ListGroup className="mb-4">
          {contacts.map(c => (
            <ListGroup.Item key={c.id}>
              <Row className="align-items-center">
                <Col>
                  <strong>[{c.category}]</strong> {c.type}: {c.detail}
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setEditing(c)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <h3>{editing ? "Edit Contact" : "Add New Contact"}</h3>
        <ContactForm
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
