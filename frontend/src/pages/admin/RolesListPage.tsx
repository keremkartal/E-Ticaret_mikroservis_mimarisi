import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, Alert, Badge, Stack, Spinner, Row, Col, Card } from 'react-bootstrap'; 
import { adminService } from '../../api/userService';
import type { Role as RoleSchema, Permission as PermissionSchema } from '../../api/userService';
import RoleFormModal from './RoleFormModal'; 
import RolePermissionsModal from './RolePermissionsModal'; 
import PermissionFormModal from './PermissionFormModal'; 
import ListGroup from 'react-bootstrap/ListGroup';

export default function RolesListPage() {
  const [roles, setRoles] = useState<RoleSchema[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionSchema[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false); 
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showRoleFormModal, setShowRoleFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleSchema | undefined>(undefined);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsTargetRole, setPermissionsTargetRole] = useState<RoleSchema | undefined>(undefined);

  const [showPermissionFormModal, setShowPermissionFormModal] = useState(false); 

  const adminRoleId = 1; 
  const userRoleId = 2; 

  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true); 
    setError(null);
    try {
      const response = await adminService.listRoles();
      setRoles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Roller yüklenirken bir hata oluştu.');
      console.error("Rolleri yükleme hatası:", err);
    } finally {
      setIsLoadingRoles(false); 
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    setIsLoadingPermissions(true); 
    setError(null); 
    try {
      const response = await adminService.listPermissions(); 
      setAllPermissions(response.data);
    } catch (err: any) {
      console.error("İzinleri yükleme hatası:", err);
      setError(prevError => prevError ? `${prevError}\nİzinler yüklenemedi.` : 'İzinler yüklenemedi.');
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);


  useEffect(() => {
    loadRoles();
    loadPermissions(); 
  }, [loadRoles, loadPermissions]);

  const handleShowSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleOpenRoleForm = (role?: RoleSchema) => {
    setEditingRole(role);
    setShowRoleFormModal(true);
  };
  const handleCloseRoleForm = () => {
    setShowRoleFormModal(false);
    setEditingRole(undefined); 
  };
  const handleRoleFormSuccess = () => {
    handleShowSuccessMessage(editingRole ? 'Rol başarıyla güncellendi.' : 'Rol başarıyla oluşturuldu.');
    loadRoles(); 
  };

  const handleDeleteRole = async (role: RoleSchema) => {
    if (role.id === adminRoleId || role.id === userRoleId) {
        alert(`'${role.name}' temel rolü silinemez.`);
        return;
    }
    if (window.confirm(`'${role.name}' adlı rolü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      setIsLoadingRoles(true); 
      setError(null);
      try {
        await adminService.deleteRole(role.id);
        handleShowSuccessMessage(`'${role.name}' rolü başarıyla silindi.`);
        loadRoles(); 
      } catch (err: any) {
        setError(err.response?.data?.detail || `'${role.name}' rolü silinirken bir hata oluştu.`);
        console.error("Rol silme hatası:", err);
      } finally {
        setIsLoadingRoles(false);
      }
    }
  };

  const handleOpenPermissionsModal = (role: RoleSchema) => {
    setPermissionsTargetRole(role);
    setShowPermissionsModal(true);
  };
  const handleClosePermissionsModal = () => {
    setShowPermissionsModal(false);
    setPermissionsTargetRole(undefined);
  };
  const handlePermissionsSaveSuccess = () => {
    handleShowSuccessMessage(`'${permissionsTargetRole?.name}' rolünün izinleri başarıyla güncellendi.`);
    loadRoles(); 
  };

  const handleOpenPermissionForm = () => {
    setShowPermissionFormModal(true);
  };
  const handleClosePermissionForm = () => {
    setShowPermissionFormModal(false);
  };
  const handlePermissionFormSuccess = () => {
    handleShowSuccessMessage('İzin başarıyla oluşturuldu.');
    loadPermissions(); 
  };

  const isInitialLoading = (isLoadingRoles && roles.length === 0) || (isLoadingPermissions && allPermissions.length === 0);

  if (isInitialLoading) { 
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
        <p>Veriler yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}

      <Row className="mb-3">
        <Col md={8}>
          <h2>Rol ve İzin Yönetimi</h2>
        </Col>
        <Col md={4} className="text-md-end">
          <Stack direction="horizontal" gap={2} className="justify-content-end">
            <Button variant="success" onClick={handleOpenPermissionForm}>
              Yeni İzin Ekle
            </Button>
            <Button variant="primary" onClick={() => handleOpenRoleForm()}>
              Yeni Rol Ekle
            </Button>
          </Stack>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <Card className="shadow-sm mb-3"> {/* mb-3 eklendi */}
            <Card.Header as="h5">Mevcut Roller</Card.Header>
            <Card.Body>
              {isLoadingRoles && roles.length === 0 && <div className="text-center"><Spinner animation="border" size="sm" /> Roller yükleniyor...</div>}
              {!isLoadingRoles && roles.length === 0 && <Alert variant="info">Kayıtlı rol bulunmamaktadır.</Alert>}
              {!isLoadingRoles && roles.length > 0 && (
                <Table striped bordered hover responsive size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Rol Adı</th>
                      <th>Açıklama</th>
                      <th>İzinler</th>
                      <th style={{width: '200px'}}>Eylemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>{role.description || '-'}</td>
                        <td>
                          {role.permissions && role.permissions.length > 0
                            ? role.permissions.map(permission => (
                                <Badge pill bg="secondary" key={permission} className="me-1 mb-1 fw-normal">
                                  {permission}
                                </Badge>
                              ))
                            : <Badge pill bg="light" text="dark" className="fw-normal">İzin Yok</Badge>
                          }
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={1}>
                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenRoleForm(role)} title="Rolü Düzenle" disabled={role.id === adminRoleId || role.id === userRoleId} >
                              Düzenle
                            </Button>
                            <Button variant="outline-info" size="sm" onClick={() => handleOpenPermissionsModal(role)} title="İzinleri Yönet" >
                              İzinler
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRole(role)} title="Rolü Sil" disabled={role.id === adminRoleId || role.id === userRoleId} >
                              Sil
                            </Button>
                          </Stack>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm mb-3"> 
            <Card.Header as="h5">Sistem İzinleri</Card.Header>
            <Card.Body>
              {isLoadingPermissions && allPermissions.length === 0 && <div className="text-center"><Spinner animation="border" size="sm" /> İzinler yükleniyor...</div>}
              {!isLoadingPermissions && allPermissions.length === 0 && <Alert variant="info">Sistemde tanımlı izin bulunmamaktadır.</Alert>}
              {!isLoadingPermissions && allPermissions.length > 0 && (
                <ListGroup variant="flush">
                  {allPermissions.map(permission => (
                    <ListGroup.Item key={permission.id} className="d-flex justify-content-between align-items-start py-2"> {/* py-2 eklendi */}
                      <div>
                        <strong>{permission.name}</strong>
                        {permission.description && <small className="d-block text-muted">{permission.description}</small>}
                      </div>
                      <Badge bg="light" text="dark" pill>ID: {permission.id}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
             <Card.Footer className="text-muted">
                Yeni izinler ekleyebilir ve bu izinleri rollere atayabilirsiniz.
            </Card.Footer>
          </Card>
        </Col>
      </Row>


      {showRoleFormModal && (
        <RoleFormModal
            show={showRoleFormModal}
            onClose={handleCloseRoleForm}
            role={editingRole}
            onSuccess={handleRoleFormSuccess}
        />
      )}

      {showPermissionsModal && permissionsTargetRole && allPermissions && (
        <RolePermissionsModal
            show={showPermissionsModal}
            onClose={handleClosePermissionsModal}
            role={permissionsTargetRole}
            allPermissions={allPermissions} 
            onSuccess={handlePermissionsSaveSuccess}
        />
      )}

      {showPermissionFormModal && (
        <PermissionFormModal
            show={showPermissionFormModal}
            onClose={handleClosePermissionForm}
            onSuccess={handlePermissionFormSuccess}
        />
      )}
    </Container>
  );
}
