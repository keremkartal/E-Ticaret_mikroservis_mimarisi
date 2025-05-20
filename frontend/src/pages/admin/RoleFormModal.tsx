import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { adminService } from '../../api/userService';
import type { Role as RoleSchema, RoleCreate, RoleUpdate } from '../../api/userService';

interface RoleFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  role?: RoleSchema; 
}

export default function RoleFormModal({ show, onClose, onSuccess, role }: RoleFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!role; 
  useEffect(() => {
    if (role && show) {
      setName(role.name);
      setDescription(role.description || '');
    } else if (!role && show) {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [role, show]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name.trim()) {
      setError('Rol adı boş bırakılamaz.');
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && role) {
        const payload: RoleUpdate = {
          name: name.trim(),
          description: description.trim() || null, 
        };
        await adminService.updateRole(role.id, payload);
      } else {
        const payload: RoleCreate = {
          name: name.trim(),
          description: description.trim() || null,
        };
        await adminService.createRole(payload);
      }
      onSuccess(); 
      onClose();  
    } catch (err: any) {
      setError(err.response?.data?.detail || (isEditing ? 'Rol güncellenirken bir hata oluştu.' : 'Rol oluşturulurken bir hata oluştu.'));
      console.error("Rol formu hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExited = () => {
    if (!isEditing) { 
        setName('');
        setDescription('');
    }
    setError(null);
  };

  return (
    <Modal show={show} onHide={onClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Rolü Düzenle' : 'Yeni Rol Oluştur'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="roleName">
            <Form.Label>Rol Adı <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="Örn: editor, viewer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50} 
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="roleDescription">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Rolün kısa bir açıklaması (opsiyonel)"
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
            ) : (isEditing ? 'Değişiklikleri Kaydet' : 'Rolü Oluştur')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
