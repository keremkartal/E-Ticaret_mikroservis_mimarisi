// frontend/src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { userApi } from "../api/axios";

export interface UserPayload {
  sub: string;
  user_id: number;
  roles: string[];
  permissions?: string[];
  is_active: boolean;
  exp?: number;
  iat?: number;
  jti?: string;
  force_password_change?: boolean;
}

export interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<UserPayload>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initializeAuth = useCallback(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<UserPayload>(storedToken);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          console.log("Token süresi dolmuş, localStorage'dan temizleniyor.");
          localStorage.removeItem("access_token");
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          setUser(decodedToken);
          userApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Token decode edilemedi (initializeAuth):", error);
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username: string, password: string): Promise<UserPayload> => {
    setIsLoading(true);
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    try {
      const response = await userApi.post<{ access_token: string; token_type: string }>(
        "/auth/token",
        form,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const accessToken = response.data.access_token;
      const payload = jwtDecode<UserPayload>(accessToken);

      if (!payload.is_active) {
        throw new Error("AccountInactive");
      }

      localStorage.setItem("access_token", accessToken);
      setToken(accessToken);
      setUser(payload);
      userApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setIsLoading(false);
      return payload;
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login hatası:", error.response?.data || error.message);
      if (error.message === "AccountInactive" || error.response?.data?.detail === "Inactive user") {
        throw new Error("Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.");
      }
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("Incorrect username or password")) {
         throw new Error("Kullanıcı adı veya parola hatalı.");
      }
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("User not found")) {
         throw new Error("Kullanıcı bulunamadı.");
      }
      throw new Error(error.response?.data?.detail || "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    delete userApi.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    if (user?.exp) {
      const expiresIn = (user.exp * 1000) - Date.now();
      if (expiresIn > 0) {
        const timer = setTimeout(() => {
          console.log("Token süresi doldu, otomatik logout yapılıyor.");
          logout();
        }, expiresIn);
        return () => clearTimeout(timer);
      } else if (token) {
        logout();
      }
    }
    return undefined;
  }, [user, token, logout]);


  const isAdmin = !!user?.roles?.includes("admin");

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, isAdmin, login, logout }}
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