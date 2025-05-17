import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { userService } from "../api/userService";
import { type AddressSchema  } from "../api/userService";
interface Props {
  initialData?: AddressSchema;
  onSaved: () => void;
}

export default function AddressForm({ initialData, onSaved }: Props) {
  const isEdit = Boolean(initialData);
  const [category, setCategory] = useState<"home" | "work">(initialData?.category ?? "home");
  const [street, setStreet]     = useState(initialData?.street     ?? "");
  const [city, setCity]         = useState(initialData?.city       ?? "");
  const [country, setCountry]   = useState(initialData?.country    ?? "");
  const [postalCode, setPostal] = useState(initialData?.postal_code ?? "");

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setStreet(initialData.street);
      setCity(initialData.city);
      setCountry(initialData.country);
      setPostal(initialData.postal_code);
    } else {
      setCategory("home"); setStreet(""); setCity(""); setCountry(""); setPostal("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { category, street, city, country, postal_code: postalCode };
    if (isEdit && initialData) {
      await userService.updateAddress(initialData.id, payload);
    } else {
      await userService.addAddress(payload);
    }
    onSaved();
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="addressCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="addressPostal">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                value={postalCode}
                onChange={e => setPostal(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="addressStreet">
            <Form.Label>Street</Form.Label>
            <Form.Control
              value={street}
              onChange={e => setStreet(e.target.value)}
            />
          </Form.Group>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="addressCity">
              <Form.Label>City</Form.Label>
              <Form.Control
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="addressCountry">
              <Form.Label>Country</Form.Label>
              <Form.Control
                value={country}
                onChange={e => setCountry(e.target.value)}
              />
            </Form.Group>
          </Row>
          <Button variant={isEdit ? "warning" : "primary"} type="submit">
            {isEdit ? "Update" : "Save"}
          </Button>
          {isEdit && (
            <Button variant="secondary" className="ms-2" onClick={() => onSaved()}>
              Cancel
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
