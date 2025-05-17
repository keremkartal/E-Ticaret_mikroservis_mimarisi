// src/components/Header.tsx
import React from "react";
import { useAuth } from "../auth/AuthContext";  // token ve user’ı çekmek için

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: 16 }}>
      <h1>E-Market</h1>
      {user ? (
        <div>
          <span style={{ marginRight: 16 }}>
            {user.sub} ({user.user_id})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </header>
  );
}
