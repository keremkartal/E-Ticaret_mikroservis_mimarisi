import { productApi } from "./axios";

export interface ProductOut {
  id: number;
  name: string;
  description: string | null;
  price: string;        
  stock: number;
  is_visible: boolean;
  category_id: number | null;
  category?: {
    id: number;
   name: string;
    description?: string | null;
  };
}

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

export const productService = {
  listProducts: (skip = 0, limit = 100) =>
    productApi.get<ProductOut[]>("/products", { params: { skip, limit } }),

  getProduct: (id: number) =>
    productApi.get<ProductOut>(`/products/${id}`),

  createProduct: (data: ProductCreate) =>
    productApi.post<ProductOut>("/products", data),

  bulkCreateProducts: (data: ProductCreate[]) =>
    productApi.post<ProductOut[]>("/products/bulk", data),

  updateProduct: (id: number, data: ProductUpdate) =>
    productApi.put<ProductOut>(`/products/${id}`, data),

  deleteProduct: (id: number) =>
    productApi.delete<void>(`/products/${id}`),

  setVisibility: (id: number, is_visible: boolean) =>
    productApi.patch<ProductOut>(`/products/${id}/visibility`, null, {
      params: { is_visible },
    }),


    
};
