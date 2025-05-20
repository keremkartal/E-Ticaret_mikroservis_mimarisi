// frontend/src/pages/admin/UserRolesModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { adminService } from '../../api/userService';
import type { UserAdminDTO, Role as RoleSchema } from '../../api/userService'; // RoleSchema'yı Role olarak kullanıyoruz

interface UserRolesModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // Başarılı işlem sonrası çağrılacak fonksiyon
  user?: UserAdminDTO; // Rolleri yönetilecek kullanıcı
  allAvailableRoles: RoleSchema[]; // Sistemdeki tüm roller
}

export default function UserRolesModal({ show, onClose, onSuccess, user, allAvailableRoles }: UserRolesModalProps) {
  // Kullanıcının mevcut rollerinin ID'lerini ve seçili rol ID'lerini tutacak state
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mapRoleNamesToIds = useCallback((roleNames: string[]): Set<number> => {
    const ids = new Set<number>();
    if (!allAvailableRoles || !roleNames) return ids;
    roleNames.forEach(name => {
      const roleObj = allAvailableRoles.find(r => r.name === name);
      if (roleObj) {
        ids.add(roleObj.id);
      }
    });
    return ids;
  }, [allAvailableRoles]);

  useEffect(() => {
    if (user && show) {
      // Modal açıldığında ve bir kullanıcı belirtilmişse,
      // bu kullanıcının mevcut rollerini (isimlerden ID'lere map ederek) `selectedRoleIds` state'ine ata.
      setSelectedRoleIds(mapRoleNamesToIds(user.roles || []));
    } else if (!user && show) {
      setSelectedRoleIds(new Set()); // Kullanıcı yoksa seçimi temizle
    }
    setError(null); // Modal her açıldığında/kapandığında hatayı temizle
  }, [user, show, mapRoleNamesToIds]);

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(roleId)) {
        newSelectedIds.delete(roleId);
      } else {
        newSelectedIds.add(roleId);
      }
      return newSelectedIds;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError('Rolleri atanacak bir kullanıcı seçilmedi.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const roleIdsArray = Array.from(selectedRoleIds);
      // `setUserRoles` fonksiyonu backend'e seçili rol ID'lerini gönderir.
      await adminService.setUserRoles(user.id, roleIdsArray);
      onSuccess(); // Başarı callback'ini çağır
      onClose();   // Modalı kapat
    } catch (err: any) {
      setError(err.response?.data?.detail || `Kullanıcı rolleri güncellenirken bir hata oluştu.`);
      console.error("Kullanıcı rolleri formu hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExited = () => {
    setError(null);
  };

  if (!user) {
    return null;
  }

  return (
    <Modal show={show} onHide={onClose} centered size="lg" onExited={handleExited} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          Rolleri Yönet: <Badge bg="info" text="dark">{user.username}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <p className="mb-1">Bu kullanıcı için aşağıdaki rollerden istediklerinizi seçin:</p>
          <small className="text-muted d-block mb-3">
            Seçili roller, kullanıcının sistemdeki yetkilerini belirler.
          </small>

          {allAvailableRoles.length === 0 && (
            <Alert variant="info">Sistemde tanımlı herhangi bir rol bulunamadı.</Alert>
          )}

          <ListGroup>
            {allAvailableRoles.map((role) => (
              <ListGroup.Item key={role.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{role.name}</strong>
                  {role.description && <small className="d-block text-muted">{role.description}</small>}
                </div>
                <Form.Check
                  type="switch"
                  id={`userrole-${user.id}-role-${role.id}`}
                  label={selectedRoleIds.has(role.id) ? "Atanmış" : "Ata"}
                  checked={selectedRoleIds.has(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                  disabled={isLoading || (role.name === 'admin' && user.username === 'admin')} // Örnek: 'admin' kullanıcısının 'admin' rolü değiştirilemesin
                  aria-label={`Rol ${role.name}`}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
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
            ) : 'Rolleri Kaydet'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
