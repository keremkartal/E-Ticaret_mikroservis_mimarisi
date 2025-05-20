import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { createContact } from "../api/contacts";
import React, { useState, useEffect } from "react";
import { userService } from "../api/userService";
import { type ContactSchema  } from "../api/userService";
interface Props {
  initialData?: ContactSchema;
  onSaved: () => void;
}

export default function ContactForm({ initialData, onSaved }: Props) {
  const isEdit = Boolean(initialData);
  const [type, setType]         = useState(initialData?.type ?? "");
  const [detail, setDetail]     = useState(initialData?.detail ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Ev");

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDetail(initialData.detail);
      setCategory(initialData.category);
    } else {
      setType("");
      setDetail("");
      setCategory("Ev");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { type, detail, category };
    if (isEdit && initialData) {
      await userService.updateContact(initialData.id, payload);
    } else {
      await userService.addContact(payload);
    }
    onSaved();
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="Ev">Ev</option>
                <option value="İş">İş</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="type">
              <Form.Label>Type</Form.Label>
              <Form.Control
                value={type}
                onChange={e => setType(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="detail">
            <Form.Label>Detail</Form.Label>
            <Form.Control
              value={detail}
              onChange={e => setDetail(e.target.value)}
            />
          </Form.Group>
          <Button variant={isEdit ? "warning" : "primary"} type="submit">
            {isEdit ? "Update" : "Save"}
          </Button>
          {isEdit && (
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => onSaved()}
            >
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
