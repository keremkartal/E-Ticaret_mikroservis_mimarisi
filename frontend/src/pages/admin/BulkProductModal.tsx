import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import {
  productService,
  
} from "../../api/productService";
import type {
  ProductCreate,
} from "../../api/productService";
import { categoryService } from "../../api/categoryService";
import type {  CategoryOut } from "../../api/categoryService";

export default function BulkProductModal({
  onClose,
  onBulkCreated,
}: {
  onClose: () => void;
  onBulkCreated: () => void;
}) {
  const [rows, setRows] = useState<ProductCreate[]>([
    { name: "", description: "", price: 0, stock: 0, is_visible: true, category_id: null },
  ]);
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.listCategories()
      .then(r => setCategories(r.data))
      .catch(() => {});
  }, []);

  const addRow = () =>
    setRows([...rows, { name: "", description: "", price: 0, stock: 0, is_visible: true, category_id: null }]);

  const removeRow = (i: number) =>
    setRows(rows.filter((_, idx) => idx !== i));

  const updateCell = (i: number, field: keyof ProductCreate, value: any) => {
    const newRows = [...rows];
    // @ts-ignore
    newRows[i][field] = value;
    setRows(newRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = rows.filter(r => r.name.trim() !== "");
      if (payload.length === 0) {
        setError("En az bir ürün adı girmeniz gerekiyor.");
        setLoading(false);
        return;
      }
      await productService.bulkCreateProducts(payload);
      onBulkCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Toplu ekleme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Toplu Ürün Ekle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Ad</th>
                <th>Açıklama</th>
                <th>Fiyat (₺)</th>
                <th>Stok</th>
                <th>Kategori</th>
                <th>Görünür</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <Form.Control
                      value={row.name}
                      onChange={e => updateCell(i, "name", e.target.value)}
                      placeholder="Ürün adı"
                      required
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={row.description}
                      onChange={e => updateCell(i, "description", e.target.value)}
                      placeholder="Açıklama"
                    />
                  </td>
                  <td>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={e => updateCell(i, "price", parseFloat(e.target.value))}
                        required
                      />
                      <InputGroup.Text>₺</InputGroup.Text>
                    </InputGroup>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={row.stock}
                      onChange={e => updateCell(i, "stock", parseInt(e.target.value))}
                      required
                    />
                  </td>
                  <td>
                    <Form.Select
                      value={row.category_id ?? ""}
                      onChange={e => updateCell(i, "category_id", e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">— Seçiniz —</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Check
                      checked={row.is_visible}
                      onChange={e => updateCell(i, "is_visible", e.target.checked)}
                    />
                  </td>
                  <td className="text-center">
                    <Button variant="outline-danger" size="sm" onClick={() => removeRow(i)}>
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between mb-3">
            <Button variant="outline-primary" onClick={addRow}>
              + Satır Ekle
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Toplu Kaydet"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
