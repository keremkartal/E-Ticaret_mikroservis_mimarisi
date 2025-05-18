// frontend/src/pages/admin/UsersList.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Alert } from "react-bootstrap";
import { adminService } from "../../api/userService";
import UserFormModal from "./UserFormModal"; // Bu bileşenin path'ini kontrol edin
import { type UserAdminDTO, type AdminResetPasswordResponse } from "../../api/userService";

export default function UsersList() {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [editingUser, setEditingUser] = useState<UserAdminDTO | undefined>(undefined);
  const [showUserModal, setShowUserModal] = useState(false);
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const reloadUsers = () => {
    adminService.listUsers()
      .then(response => setUsers(response.data))
      .catch(error => {
        console.error("Failed to load users:", error);
        setOperationMessage({ type: 'danger', text: 'Kullanıcı listesi yüklenirken bir hata oluştu.' });
      });
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const handleDeactivate = async (userId: number, username: string) => {
    if (window.confirm(`${username} adlı kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?`)) {
      setOperationMessage(null);
      try {
        await adminService.deactivateUser(userId);
        reloadUsers();
        setOperationMessage({ type: 'success', text: `${username} adlı kullanıcı başarıyla devre dışı bırakıldı.` });
      } catch (error: any) {
        console.error("Deactivation failed:", error);
        setOperationMessage({ type: 'danger', text: `Kullanıcı devre dışı bırakılırken hata: ${error.response?.data?.detail || error.message}` });
      }
    }
  };

  const handleActivate = async (userId: number, username: string) => {
    if (!window.confirm(`${username} adlı kullanıcıyı aktif etmek istediğinizden emin misiniz?`)) return;
    setOperationMessage(null);
    try {
      await adminService.activateUser(userId);
      reloadUsers();
      setOperationMessage({ type: 'success', text: `${username} adlı kullanıcı başarıyla aktif edildi.` });
    } catch (error: any) {
      console.error("Activation failed:", error);
      setOperationMessage({ type: 'danger', text: `Kullanıcı aktif edilirken hata: ${error.response?.data?.detail || error.message}` });
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
        setOperationMessage({ type: 'success', text: messageText });
        reloadUsers(); 
      } catch (error: any) {
        console.error("Password reset failed:", error);
        setOperationMessage({ type: 'danger', text: `Şifre sıfırlanırken bir hata oluştu: ${error.response?.data?.detail || error.message}` });
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

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Kullanıcı Yönetimi</h2>
        <Button onClick={openNewUserModal}>
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      {operationMessage && (
        <Alert variant={operationMessage.type} onClose={() => setOperationMessage(null)} dismissible>
          {operationMessage.text}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Kullanıcı Adı</th>
            <th>E-posta</th>
            <th>Durum</th>
            <th>Roller</th>
            <th>Şifre Talebi?</th>
            <th>Eylemler</th>
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
              <td>{user.roles?.join(', ') || '-'}</td>
              <td>
                {user.must_change === 1 && <Badge bg="warning" text="dark">Evet</Badge>}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="me-1 mb-1"
                  onClick={() => openEditUserModal(user)}
                >
                  Düzenle
                </Button>
                {user.is_active ? (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="me-1 mb-1"
                    onClick={() => handleDeactivate(user.id, user.username)}
                  >
                    Devre Dışı Bırak
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline-success"
                    className="me-1 mb-1"
                    onClick={() => handleActivate(user.id, user.username)}
                  >
                    Aktif Et
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline-warning"
                  className="mb-1"
                  onClick={() => handleResetPassword(user)}
                  title={user.must_change === 1 ? "Şifreyi E-postasına Sıfırla (Talep Var)" : "Şifreyi E-postasına Sıfırla"}
                >
                  Şifreyi Sıfırla
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Kullanıcı Oluşturma/Düzenleme Modalı */}
      {showUserModal && (
        <UserFormModal
          user={editingUser} 
          // HATA DÜZELTMESİ: 'show' prop'u kaldırıldı, çünkü UserFormModal'ın prop tiplerinde tanımlı değil.
          // Modal'ın görünürlüğü zaten `showUserModal && ...` ile kontrol ediliyor.
          // show={showUserModal} 
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(undefined); 
            reloadUsers();
          }}
        />
      )}
    </>
  );
}
