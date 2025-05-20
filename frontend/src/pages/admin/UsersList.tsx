// frontend/src/pages/admin/UsersList.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Badge, Alert, Stack, Spinner,Container } from "react-bootstrap"; // Stack ve Spinner import edildi
import { adminService } from "../../api/userService";
import UserFormModal from "./UserFormModal";
import UserRolesModal from "./UserRolesModal"; // YENİ: UserRolesModal import edildi
import { type UserAdminDTO, type AdminResetPasswordResponse, type Role as RoleSchema } from "../../api/userService"; // RoleSchema import edildi

export default function UsersList() {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [allAvailableRoles, setAllAvailableRoles] = useState<RoleSchema[]>([]); // YENİ: Tüm roller için state
  const [editingUser, setEditingUser] = useState<UserAdminDTO | undefined>(undefined);
  const [userForRolesModal, setUserForRolesModal] = useState<UserAdminDTO | undefined>(undefined); // YENİ: Rolleri düzenlenecek kullanıcı
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserRolesModal, setShowUserRolesModal] = useState(false); // YENİ: Rol modalı için state
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Kullanıcı listesi yükleme durumu
  const [isLoadingRoles, setIsLoadingRoles] = useState(false); // Roller yükleme durumu

  const reloadUsers = useCallback(() => {
    setIsLoadingUsers(true);
    adminService.listUsers()
      .then(response => setUsers(response.data))
      .catch(error => {
        console.error("Failed to load users:", error);
        setOperationMessage({ type: 'danger', text: 'Kullanıcı listesi yüklenirken bir hata oluştu.' });
      })
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const loadAllRoles = useCallback(() => { // YENİ: Tüm rolleri yükleme fonksiyonu
    setIsLoadingRoles(true);
    adminService.listRoles()
      .then(response => setAllAvailableRoles(response.data))
      .catch(error => {
        console.error("Failed to load roles:", error);
        // Rolleri yükleyemezsek kullanıcıya bilgi verebiliriz, ancak sayfa çalışmaya devam etmeli
        setOperationMessage(prev => ({
          type: 'danger',
          text: (prev?.text || '') + '\nSistem rolleri yüklenemedi. Rol atama işlevi düzgün çalışmayabilir.'
        }));
      })
      .finally(() => setIsLoadingRoles(false));
  }, []);

  useEffect(() => {
    reloadUsers();
    loadAllRoles(); // Sayfa yüklendiğinde rolleri de yükle
  }, [reloadUsers, loadAllRoles]);

  const handleShowOperationMessage = (type: 'success' | 'danger', text: string) => {
    setOperationMessage({ type, text });
    setTimeout(() => setOperationMessage(null), 4000); // Mesajı 4 saniye sonra temizle
  };

  const handleDeactivate = async (userId: number, username: string) => {
    if (window.confirm(`${username} adlı kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?`)) {
      setOperationMessage(null);
      try {
        await adminService.deactivateUser(userId);
        reloadUsers();
        handleShowOperationMessage('success', `${username} adlı kullanıcı başarıyla devre dışı bırakıldı.`);
      } catch (error: any) {
        handleShowOperationMessage('danger', `Kullanıcı devre dışı bırakılırken hata: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleActivate = async (userId: number, username: string) => {
    if (!window.confirm(`${username} adlı kullanıcıyı aktif etmek istediğinizden emin misiniz?`)) return;
    setOperationMessage(null);
    try {
      await adminService.activateUser(userId);
      reloadUsers();
      handleShowOperationMessage('success', `${username} adlı kullanıcı başarıyla aktif edildi.`);
    } catch (error: any) {
      handleShowOperationMessage('danger', `Kullanıcı aktif edilirken hata: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleResetPassword = async (userToReset: UserAdminDTO) => {
    if (window.confirm(`${userToReset.username} adlı kullanıcının şifresini e-posta adresine (${userToReset.email}) sıfırlamak istediğinizden emin misiniz?`)) {
      setOperationMessage(null);
      try {
        const response = await adminService.adminSetUserPasswordToEmail(userToReset.id);
        const data: AdminResetPasswordResponse = response.data;
        let messageText = data.detail;
        if (data.temporary_password_is_email) {
          messageText += ` Kullanıcının yeni geçici şifresi e-posta adresidir: ${data.temporary_password_is_email}`;
        }
        handleShowOperationMessage('success', messageText);
        reloadUsers(); 
      } catch (error: any) {
        handleShowOperationMessage('danger', `Şifre sıfırlanırken bir hata oluştu: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const openNewUserModal = () => {
    setEditingUser(undefined); 
    setShowUserModal(true);
  };

  const openEditUserModal = (user: UserAdminDTO) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  // YENİ: Kullanıcı rolleri modalını açma fonksiyonu
  const openUserRolesModal = (user: UserAdminDTO) => {
    setUserForRolesModal(user);
    setShowUserRolesModal(true);
  };
  
  const handleUserRolesSuccess = () => {
    handleShowOperationMessage('success', `${userForRolesModal?.username} adlı kullanıcının rolleri başarıyla güncellendi.`);
    reloadUsers(); // Kullanıcı listesini yenileyerek güncel rolleri göster
  };

  if (isLoadingUsers && users.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Kullanıcılar yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4"> {/* Container fluid eklendi */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Kullanıcı Yönetimi</h2>
        <Button variant="primary" onClick={openNewUserModal}> {/* primary variant eklendi */}
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      {operationMessage && (
        <Alert variant={operationMessage.type} onClose={() => setOperationMessage(null)} dismissible>
          {operationMessage.text}
        </Alert>
      )}

      <Table striped bordered hover responsive className="shadow-sm"> {/* responsive ve shadow eklendi */}
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Kullanıcı Adı</th>
            <th>E-posta</th>
            <th>Durum</th>
            <th>Roller</th>
            <th>Şifre Talebi?</th>
            <th style={{minWidth: '280px'}}>Eylemler</th> {/* Eylemler sütun genişliği ayarlandı */}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {user.is_active
                  ? <Badge bg="success">Aktif</Badge>
                  : <Badge bg="secondary">Pasif</Badge>}
              </td>
              <td>
                {user.roles && user.roles.length > 0 
                    ? user.roles.map(roleName => (
                        <Badge bg="info" text="dark" key={roleName} className="me-1 mb-1">{roleName}</Badge>
                      )) 
                    : <Badge bg="light" text="dark">Rol Yok</Badge>
                }
              </td>
              <td>
                {user.must_change === 1 && <Badge bg="warning" text="dark">Evet</Badge>}
              </td>
              <td>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => openEditUserModal(user)}
                    title="Kullanıcıyı Düzenle"
                  >
                    Düzenle
                  </Button>
                  {/* YENİ: Rolleri Yönet Butonu */}
                  <Button
                    size="sm"
                    variant="outline-info" // Farklı bir renk
                    onClick={() => openUserRolesModal(user)}
                    title="Kullanıcı Rollerini Yönet"
                    disabled={isLoadingRoles} // Roller yüklenirken butonu pasif yap
                  >
                    Roller
                  </Button>
                  {user.is_active ? (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeactivate(user.id, user.username)}
                      title="Kullanıcıyı Devre Dışı Bırak"
                    >
                      Pasif Yap
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleActivate(user.id, user.username)}
                      title="Kullanıcıyı Aktif Et"
                    >
                      Aktif Et
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-warning"
                    onClick={() => handleResetPassword(user)}
                    title={user.must_change === 1 ? "Şifreyi E-postasına Sıfırla (Talep Var)" : "Şifreyi E-postasına Sıfırla"}
                  >
                    Şifre Sıfırla
                  </Button>
                </Stack>
              </td>
            </tr>
          ))}
           {users.length === 0 && !isLoadingUsers && (
            <tr>
                <td colSpan={7} className="text-center">Kayıtlı kullanıcı bulunmamaktadır.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {showUserModal && (
        <UserFormModal
          user={editingUser} 
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(undefined); 
            reloadUsers();
          }}
        />
      )}
      {/* YENİ: Kullanıcı Rolleri Modalı */}
      {showUserRolesModal && userForRolesModal && (
        <UserRolesModal
            show={showUserRolesModal}
            onClose={() => {
                setShowUserRolesModal(false);
                setUserForRolesModal(undefined);
            }}
            onSuccess={handleUserRolesSuccess}
            user={userForRolesModal}
            allAvailableRoles={allAvailableRoles}
        />
      )}
    </Container>
  );
}
