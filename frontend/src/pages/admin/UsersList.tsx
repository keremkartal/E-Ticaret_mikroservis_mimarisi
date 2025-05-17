import React, { useEffect, useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { adminService } from "../../api/userService";
import UserFormModal from "./UserFormModal";
import { type UserAdminDTO  } from "../../api/userService";

export default function UsersList() {
  const [users, setUsers] = useState<UserAdminDTO[]>([]);
  const [editing, setEditing] = useState<UserAdminDTO|null>(null);
  const [showNew, setShowNew] = useState(false);

  const reload = () => adminService.listUsers().then(r => setUsers(r.data));
useEffect(() => {
  reload();
}, []);
  const handleDeactivate = async (id:number) => {
    if (confirm("Deactivate user?")) {
      await adminService.deactivate(id);
      reload();
    }
  };


  const handleReset = async (u: UserAdminDTO) => {
    if (window.confirm(`Reset password for ${u.username}?`)) {
      const res = await adminService.resetUserPassword(u.id);
      alert(`New temporary password: ${res.data.temporary_password}`);
    }
  };



  const handleActivate = async (id: number) => {
    if (!window.confirm("Activate user?")) return;
    await adminService.activateUser(id);
    reload();
  };
  return (
    <>
      <Button className="mb-3" onClick={() => setShowNew(true)}>New User</Button>

      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                {u.is_active
                  ? <Badge bg="success">Active</Badge>
                  : <Badge bg="secondary">Passive</Badge>}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => setEditing(u)}
                >
                  Edit
                </Button>{" "}
                {u.is_active ? (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeactivate(u.id)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => handleActivate(u.id)}
                  >
                    Activate
                  </Button>
                )}{" "}
                <Button
                  size="sm"
                  variant="outline-warning"
                  onClick={() => handleReset(u)}
                >
                  Reset Password
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* create modal */}
      {showNew && <UserFormModal onClose={()=>{setShowNew(false);reload();}} />}
      {/* edit modal */}
      {editing && <UserFormModal user={editing} onClose={()=>{setEditing(null);reload();}} />}
    </>
  );
}
