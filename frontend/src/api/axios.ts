// src/api/axios.ts
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

// 1️⃣ Base URL’ler
export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API,
});
export const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_API,
});

// 2️⃣ Request interceptor: tüm isteklerde token ekle
userApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Aynı attachToken logic’i productApi için de geçerli:
productApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3️⃣ Response interceptor: 401 geldiğinde logout ve /login’e yönlendir
userApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token sil ve login sayfasına yönlendir
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
