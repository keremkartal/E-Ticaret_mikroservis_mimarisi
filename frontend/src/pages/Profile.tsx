import React, { useEffect, useState } from "react";    
import { userService } from "../api/userService";
import type { UserOut } from "../api/userService";

import {
  Container,
  Accordion,
  Form,
  Button,
  Row,
  Col,
  Alert
} from "react-bootstrap";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [userData, setUserData] = useState<UserOut>({
    id: 0,
    username: "",
    email: "",
    roles: [],
    must_change: 0, 
    is_active: true 
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [perms, setPerms] = useState<string[]>([]);

  const [profile, setProfile] = useState<UserOut | null>(null);

  const [updUsername, setUpdUsername] = useState("");
  const [updEmail, setUpdEmail] = useState("");
  const [pwdOld, setPwdOld] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [checkRole, setCheckRole] = useState("");
  const [checkPerm, setCheckPerm] = useState("");
  const [roleResult, setRoleResult] = useState<boolean | null>(null);
  const [permResult, setPermResult] = useState<boolean | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const nav = useNavigate();

  useEffect(() => {
    userService.getMe().then(r => {
      setProfile(r.data);
      setUpdUsername(r.data.username);
      setUpdEmail(r.data.email);
    });
    userService.getMyRoles().then(r => setRoles(r.data));
    userService.getMyPermissions().then(r => setPerms(r.data));
  }, []);

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await userService.updateMe({ username: updUsername, email: updEmail });
      setProfile(r.data);
      setAlertMsg("Profile updated successfully");
    } catch (err: any) {
      setAlertMsg(err.response?.data?.detail || "Update failed");
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.changePassword({ old_password: pwdOld, new_password: pwdNew });
      setAlertMsg("Password changed");
      setPwdOld("");
      setPwdNew("");
    } catch (err: any) {
      setAlertMsg(err.response?.data?.detail || "Password change failed");
    }
  };

  const submitDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account?")) return;
    try {
      await userService.deactivateSelf();
      setAlertMsg("Account deactivated");
      nav("/login", { replace: true });
    } catch {
      setAlertMsg("Deactivation failed");
    }
  };

  const checkRoleHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await userService.hasRole(checkRole);
    setRoleResult(r.data.hasRole);
  };

  // 5) İzin kontrolü
  const checkPermHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = await userService.hasPermission(checkPerm);
    setPermResult(p.data.hasPermission);
  };

  return (
    <>
      <Container className="my-4">
        {alertMsg && (
          <Alert variant="info" onClose={() => setAlertMsg(null)} dismissible>
            {alertMsg}
          </Alert>
        )}

        <h2>My Profile</h2>
        <Accordion defaultActiveKey="0">

          {/* 1) Genel Bilgiler Güncelleme */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Update Profile</Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={submitProfile}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    value={updUsername}
                    onChange={e => setUpdUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={updEmail}
                    onChange={e => setUpdEmail(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit">Save</Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>

          {/* 2) Şifre Değiştirme */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Change Password</Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={submitPassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={pwdOld}
                    onChange={e => setPwdOld(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={pwdNew}
                    onChange={e => setPwdNew(e.target.value)}
                  />
                </Form.Group>
                <Button variant="warning" type="submit">
                  Change
                </Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>

          {/* 3) Hesabı Pasifleştir */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Deactivate Account</Accordion.Header>
            <Accordion.Body>
              <Button variant="danger" onClick={submitDeactivate}>
                Deactivate My Account
              </Button>
            </Accordion.Body>
          </Accordion.Item>

          {/* 4) Role / Permission Kontrolleri */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Check Role / Permission</Accordion.Header>
            <Accordion.Body>
              <Form onSubmit={checkRoleHandler} className="mb-3">
                <Row>
                  <Col>
                    <Form.Control
                      placeholder="role name"
                      value={checkRole}
                      onChange={e => setCheckRole(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button type="submit">Has Role?</Button>
                  </Col>
                  <Col>
                    {roleResult !== null && (
                      <Alert variant={roleResult ? "success" : "danger"}>
                        {roleResult ? "Yes" : "No"}
                      </Alert>
                    )}
                  </Col>
                </Row>
              </Form>
              <Form onSubmit={checkPermHandler}>
                <Row>
                  <Col>
                    <Form.Control
                      placeholder="permission name"
                      value={checkPerm}
                      onChange={e => setCheckPerm(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button type="submit">Has Permission?</Button>
                  </Col>
                  <Col>
                    {permResult !== null && (
                      <Alert variant={permResult ? "success" : "danger"}>
                        {permResult ? "Yes" : "No"}
                      </Alert>
                    )}
                  </Col>
                </Row>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </>
  );
}
