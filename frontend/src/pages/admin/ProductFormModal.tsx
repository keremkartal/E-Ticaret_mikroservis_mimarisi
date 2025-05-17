import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner, Alert } from "react-bootstrap";
import { productService } from "../../api/productService";
import type { ProductCreate, ProductOut } from "../../api/productService";
import { categoryService } from "../../api/categoryService";
import type { CategoryOut } from "../../api/categoryService";

interface Props {
  product?: ProductOut;
  onClose: () => void;
}

export default function ProductFormModal({ product, onClose }: Props) {
  const isEdit = !!product;
  const [name, setName]           = useState(product?.name ?? "");
  const [description, setDesc]    = useState(product?.description ?? "");
  const [price, setPrice]         = useState(product ? +product.price : 0);
  const [stock, setStock]         = useState(product?.stock ?? 0);
  const [isVisible, setIsVisible] = useState(product?.is_visible ?? true);

  // Yeni: kategori listesi ve seçilen kategori
  const [categories, setCategories]       = useState<CategoryOut[]>([]);
  const [categoryId, setCategoryId]       = useState<number | "">(
    product?.category?.id ?? ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Mevcut ürüne göre formu doldur
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDesc(product.description ?? "");
      setPrice(+product.price);
      setStock(product.stock);
      setIsVisible(product.is_visible);
      setCategoryId(product.category?.id ?? "");
    }
  }, [product]);

  // Kategorileri yükle
  useEffect(() => {
    categoryService
      .listCategories()
      .then(r => setCategories(r.data))
      .catch(() => {
        /* hata yönetimi isterseniz buraya */
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: ProductCreate = {
      name,
      description,
      price,
      stock,
      is_visible: isVisible,
      // boş seçildiyse null, değilse sayı
      category_id: categoryId === "" ? null : categoryId,
    };

    try {
      if (isEdit && product) {
        await productService.updateProduct(product.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kaydedilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Ad, Açıklama, Fiyat, Stok, Görünür... */}
          <Form.Group className="mb-3">
            <Form.Label>Ad</Form.Label>
            <Form.Control
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fiyat</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(+e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Stok</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={e => setStock(+e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Görünür"
              checked={isVisible}
              onChange={e => setIsVisible(e.target.checked)}
            />
          </Form.Group>

          {/* Yeni: Kategori seçimi */}
          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Select
              value={categoryId}
              onChange={e =>
                setCategoryId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">— Seçiniz —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit" disabled={submitting} className="w-100">
            {submitting ? <Spinner animation="border" size="sm" /> : (isEdit ? "Güncelle" : "Kaydet")}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
