import type { AxiosResponse } from "axios";
import { productApi } from "./axios";
import type { ProductOut } from "./productService";

export interface CartItemOut {
  id: number;
  product_id: number;
  quantity: number;
  product?: ProductOut; // backend ilişkiyi dönerse, yoksa undefined
}

export interface CartOut {
  id: number;
  user_id: number;
  created_at: string;
  items: CartItemOut[];
}

export const cartService = {
  // Sepeti getir
  getCart: (): Promise<AxiosResponse<CartOut>> =>
    productApi.get<CartOut>("/cart"),

  // Ürün ekle
  addItem: (product_id: number, quantity: number) =>
    productApi.post<CartOut>("/cart/items", { product_id, quantity }),

  // Adet güncelle
  updateItem: (product_id: number, quantity: number) =>
    productApi.put<CartOut>(`/cart/items/${product_id}`, { quantity }),

  // Sepetten sil
  removeItem: (product_id: number) =>
    productApi.delete<void>(`/cart/items/${product_id}`),

  // Sepeti temizle
  clearCart: () =>
    productApi.delete<void>("/cart"),
};
