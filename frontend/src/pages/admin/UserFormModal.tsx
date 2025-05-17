import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { adminService } from "../../api/userService";
import { type UserAdminDTO  } from "../../api/userService";

export default function UserFormModal({
  user,
  onClose,
}: {
  user?: UserAdminDTO;
  onClose: () => void;
}) {
  const isEdit = !!user;
  const [username,setUsername] = useState(user?.username ?? "");
  const [email,setEmail]       = useState(user?.email ?? "");
  const [password,setPassword] = useState("");

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await adminService.updateUser(user!.id,{ username,email,is_active:true });
    } else {
      await adminService.createUser({ username,email,password });
    }
    onClose();
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit? "Edit User":"New User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={e=>setUsername(e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          </Form.Group>
          {!isEdit && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
            </Form.Group>
          )}
          <Button type="submit">{isEdit? "Update":"Create"}</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
