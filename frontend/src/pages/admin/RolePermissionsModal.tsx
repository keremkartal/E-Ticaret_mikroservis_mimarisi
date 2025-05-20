import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { adminService } from '../../api/userService';
import type { Role as RoleSchema, Permission as PermissionSchema } from '../../api/userService';

interface RolePermissionsModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  role?: RoleSchema;
  allPermissions: PermissionSchema[];
}

export default function RolePermissionsModal({ show, onClose, onSuccess, role, allPermissions }: RolePermissionsModalProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role && show) {
      const currentRolePermissionIds = new Set<number>();
      role.permissions.forEach(permissionName => {
        const foundPermission = allPermissions.find(p => p.name === permissionName);
        if (foundPermission) {
          currentRolePermissionIds.add(foundPermission.id);
        }
      });
      setSelectedPermissionIds(currentRolePermissionIds);
    } else if (!role && show) {
        setSelectedPermissionIds(new Set());
    }
    setError(null);
  }, [role, show, allPermissions]);

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissionIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(permissionId)) {
        newSelectedIds.delete(permissionId);
      } else {
        newSelectedIds.add(permissionId);
      }
      return newSelectedIds;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) {
      setError('İzinleri atanacak bir rol seçilmedi.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const permissionIdsArray = Array.from(selectedPermissionIds);
      await adminService.setRolePermissions(role.id, permissionIdsArray);
      onSuccess();
      onClose();   
    } catch (err: any) {
      setError(err.response?.data?.detail || `Rol izinleri güncellenirken bir hata oluştu.`);
      console.error("Rol izinleri formu hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExited = () => {
    setError(null);
  };

  if (!role) { 
    return null; 
  }

  return (
    <Modal show={show} onHide={onClose} centered size="lg" onExited={handleExited} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
            İzinleri Yönet: <Badge bg="primary">{role.name}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <p className="mb-1">Bu rol için aşağıdaki izinlerden istediklerinizi seçin:</p>
          <small className="text-muted d-block mb-3">
            Seçili izinler, bu role sahip kullanıcıların erişebileceği yetkileri belirler.
          </small>

          {allPermissions.length === 0 && (
            <Alert variant="info">Sistemde tanımlı herhangi bir izin bulunamadı.</Alert>
          )}

          <ListGroup>
            {allPermissions.map((permission) => (
              <ListGroup.Item key={permission.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{permission.name}</strong>
                  {permission.description && <small className="d-block text-muted">{permission.description}</small>}
                </div>
                <Form.Check
                  type="switch"
                  id={`permission-${permission.id}`}
                  checked={selectedPermissionIds.has(permission.id)}
                  onChange={() => handlePermissionChange(permission.id)}
                  disabled={isLoading}
                  aria-label={`İzin ${permission.name}`}
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
            ) : 'İzinleri Kaydet'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
