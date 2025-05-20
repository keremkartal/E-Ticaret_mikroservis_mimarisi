import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { adminService } from '../../api/userService';
import type { PermissionCreate } from '../../api/userService';

interface PermissionFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // Başarılı işlem sonrası çağrılacak fonksiyon
  // Düzenleme modu şimdilik eklenmedi, sadece oluşturma.
  // permission?: PermissionSchema; 
}

export default function PermissionFormModal({ show, onClose, onSuccess }: PermissionFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (show) {
      setName('');
      setDescription('');
    }
    setError(null); 
  }, [show]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name.trim()) {
      setError('İzin adı boş bırakılamaz.');
      setIsLoading(false);
      return;
    }

    try {
      const payload: PermissionCreate = {
        name: name.trim(),
        description: description.trim() || null, 
      };
      await adminService.createPermission(payload);
      
      onSuccess(); 
      onClose();   
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İzin oluşturulurken bir hata oluştu.');
      console.error("İzin formu hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setDescription('');
    setError(null);
  };

  return (
    <Modal show={show} onHide={onClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Yeni İzin Tanımla</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="permissionName">
            <Form.Label>İzin Adı <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Örn: view_product, edit_user"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              maxLength={100} 
            />
            <Form.Text className="text-muted">
              İzin adı genellikle `action_resource` formatında olur (örn: `create_order`).
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="permissionDescription">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="İznin ne işe yaradığının kısa bir açıklaması (opsiyonel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              maxLength={255}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Kaydediliyor...
              </>
            ) : 'İzni Oluştur'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
