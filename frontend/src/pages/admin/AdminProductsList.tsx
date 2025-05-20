// frontend/src/pages/admin/AdminProductsList.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Alert } from "react-bootstrap";
import { productService } from "../../api/productService";
import { categoryService } from "../../api/categoryService";
import ProductFormModal from "./ProductFormModal";
import BulkProductModal from "./BulkProductModal";
import type { ProductOut } from "../../api/productService";
import type { CategoryCreate } from "../../api/categoryService";

export default function AdminProductsList() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [categoryMessageType, setCategoryMessageType] = useState<"success" | "danger">("success");

  const reloadProducts = () => {
    setLoading(true);
    setError(null);
    productService.listProducts()
      .then(r => setProducts(r.data))
      .catch(e => {
        console.error("Ürünler yüklenirken hata:", e);
        setError("Ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(reloadProducts, []);

  const handleDelete = async (p: ProductOut) => {
    const productNameInput = window.prompt(`"${p.name}" ürününü silmek için ürün adını tam olarak girin:`);
    if (productNameInput === null) {
      alert("Silme işlemi iptal edildi.");
      return;
    }
    if (productNameInput !== p.name) {
      alert("Ürün adı eşleşmedi, silme işlemi iptal edildi.");
      return;
    }
    try {
      await productService.deleteProduct(p.id);
      alert(`"${p.name}" ürünü başarıyla silindi.`);
      reloadProducts();
    } catch (error) {
      console.error("Ürün silinirken hata:", error);
      alert("Ürün silinemedi.");
    }
  };

  const handleCreateCategory = async () => {
    setCategoryMessage(null);
    const categoryName = window.prompt("Yeni kategori adını girin:");
    if (!categoryName || categoryName.trim() === "") {
      alert("Kategori adı boş olamaz.");
      return;
    }

    const categoryDescription = window.prompt("Kategori açıklamasını girin (isteğe bağlı):");

    const newCategory: CategoryCreate = {
      name: categoryName.trim(),
      description: categoryDescription ? categoryDescription.trim() : null,
    };

    try {
      const response = await categoryService.createCategory(newCategory);
      setCategoryMessageType("success");
      setCategoryMessage(`Kategori "${response.data.name}" başarıyla oluşturuldu!`);
    } catch (error: any) {
      console.error("Kategori oluşturulurken hata:", error);
      setCategoryMessageType("danger");
      setCategoryMessage(
        `Kategori oluşturulamadı: ${error.response?.data?.detail || error.message || "Bilinmeyen bir hata oluştu."}`
      );
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-3">Ürün Yönetimi</h2>
      
      {categoryMessage && (
        <Alert variant={categoryMessageType} onClose={() => setCategoryMessage(null)} dismissible>
          {categoryMessage}
        </Alert>
      )}
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Button className="me-2" onClick={() => { setEditing(null); setShowModal(true); }}>
              Yeni Ürün
            </Button>
            <Button variant="secondary" className="me-2" onClick={() => setShowBulkModal(true)}>
              Toplu Ürün Ekle
            </Button>
            <Button variant="info" onClick={handleCreateCategory}>
              Yeni Kategori Ekle
            </Button>
          </div>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>Görünür</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price ? parseFloat(p.price).toFixed(2) : "N/A"}</td>
                  <td>{p.stock}</td>
                  <td>{p.is_visible ? "Evet" : "Hayır"}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="me-1 mb-1 mb-md-0"
                      onClick={() => { setEditing(p); setShowModal(true); }}
                    >
                      Düzenle
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      className="mb-1 mb-md-0"
                      onClick={() => handleDelete(p)}
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {showModal && (
            <ProductFormModal
              product={editing ?? undefined}
              onClose={() => { setShowModal(false); reloadProducts(); }}
            />
          )}

          {showBulkModal && (
            <BulkProductModal
              onClose={() => setShowBulkModal(false)}
              onBulkCreated={reloadProducts}
            />
          )}
        </>
      )}
    </Container>
  );
}
