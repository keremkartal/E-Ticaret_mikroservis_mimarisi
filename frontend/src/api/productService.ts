// frontend/src/api/productService.ts
import { productApi } from "./axios";

// 1) Response modelleri
export interface ProductOut {
  id: number;
  name: string;
  description: string | null;
  price: string;         // axios Numeric(10,2) string olarak gelir
  stock: number;
  is_visible: boolean;
  category_id: number | null;
  category?: {
    id: number;
   name: string;
    description?: string | null;
  };
}

// 2) Request modelleri
export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  is_visible?: boolean;
  category_id?: number | null;
}

export type ProductUpdate = Partial<Omit<ProductCreate, "price">> &
  ( { price?: number } );

// 3) Service
export const productService = {
  // — Public endpoints —
  listProducts: (skip = 0, limit = 100) =>
    productApi.get<ProductOut[]>("/products", { params: { skip, limit } }),

  getProduct: (id: number) =>
    productApi.get<ProductOut>(`/products/${id}`),

  // — Admin-only endpoints (require admin role) —
  createProduct: (data: ProductCreate) =>
    productApi.post<ProductOut>("/products", data),

  bulkCreateProducts: (data: ProductCreate[]) =>
    productApi.post<ProductOut[]>("/products/bulk", data),

  updateProduct: (id: number, data: ProductUpdate) =>
    productApi.put<ProductOut>(`/products/${id}`, data),

  deleteProduct: (id: number) =>
    productApi.delete<void>(`/products/${id}`),

  setVisibility: (id: number, is_visible: boolean) =>
    // FastAPI endpoint’ine ?is_visible=true param ile gönderiyoruz
    productApi.patch<ProductOut>(`/products/${id}/visibility`, null, {
      params: { is_visible },
    }),


    
};
