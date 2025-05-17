// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { userApi } from "../api/axios";
// userService'den UserOut'a artık ihtiyacımız yok, UserPayload kullanacağız.
// import { userService, UserOut as ApiUserOut } from "../api/userService";

// UserPayload, JWT token'ının içindeki payload'ı temsil eder.
// Bu interface'in backend'deki token payload'ınızla eşleştiğinden emin olun.
export interface UserPayload {
  sub: string; // Genellikle username
  user_id: number;
  roles: string[];
  permissions: string[]; // Eğer token'da permissions varsa
  must_change: number;
  is_active: boolean;
  exp?: number;
  jti?: string;
}

// Context’in taşıyacağı durum ve metotlar
export interface AuthState {
  token: string | null;
  user: UserPayload | null;
  
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<UserPayload>; // UserPayload döndürecek
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<UserPayload | null>(() => {
    const t = localStorage.getItem("access_token");
    if (t) {
      try {
        return jwtDecode<UserPayload>(t);
      } catch (error) {
        console.error("Token decode edilemedi (localStorage):", error);
        localStorage.removeItem("access_token");
        return null;
      }
    }
    return null;
  });

  const isAdmin = !!user?.roles?.includes("admin");

  // Token'ın geçerliliğini ve senkronizasyonunu yöneten useEffect
  useEffect(() => {
    const currentToken = localStorage.getItem("access_token");
    if (currentToken) {
      try {
        const decodedToken = jwtDecode<UserPayload>(currentToken);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          console.log("Token süresi dolmuş, logout yapılıyor (useEffect).");
          logout(); // Token süresi dolmuşsa logout yap
        } else {
          // Token geçerli, context state'ini senkronize et
          if (token !== currentToken) setToken(currentToken);
          if (!user || user.jti !== decodedToken.jti) setUser(decodedToken); // jti varsa karşılaştır
        }
      } catch (error) {
        console.error("Token decode/validation hatası (useEffect):", error);
        logout(); // Hata durumunda logout yap
      }
    } else {
      // Token yoksa context state'ini temizle
      if (token !== null) setToken(null);
      if (user !== null) setUser(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Token değiştiğinde bu effect'i tekrar çalıştır (login/logout sonrası)

  const login = async (username: string, password: string): Promise<UserPayload> => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    
    try {
      const response = await userApi.post<{ access_token: string; token_type: string }>(
        "/auth/token", 
        form,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
      );
      
      const accessToken = response.data.access_token;
      const payload = jwtDecode<UserPayload>(accessToken);

      if (!payload.is_active) {
        // Kullanıcı aktif değilse hata fırlat, Login.tsx bunu yakalayacak
        throw new Error("AccountInactive"); 
      }

      // Token ve kullanıcı bilgilerini localStorage'a ve state'e kaydet
      localStorage.setItem("access_token", accessToken);
      setToken(accessToken); // Bu, yukarıdaki useEffect'i tetikleyebilir, bu yüzden dikkatli olmalı
      setUser(payload);      // veya useEffect'in bağımlılıklarını ayarlamalı.
                             // Şimdilik, useEffect'in token'a bağımlı olması yeterli.
      
      return payload; // Login.tsx'in kullanması için payload'ı döndür

    } catch (error: any) {
      console.error("Login hatası:", error.response?.data || error.message);
      if (error.response?.data?.detail === "Inactive user") {
          throw new Error("AccountInactive");
      }
      // FastAPI'nin OAuth2PasswordRequestForm için varsayılan hatası genellikle 400 Bad Request'tir
      // ve detail'de "Incorrect username or password" yazar.
      throw new Error(error.response?.data?.detail || "Kullanıcı adı veya parola hatalı.");
    }
  };

  const logout = () => {
    // userApi.post("/auth/logout"); // Backend'de logout endpoint'i varsa çağrılabilir (opsiyonel)
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login"; // En basit yönlendirme
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
