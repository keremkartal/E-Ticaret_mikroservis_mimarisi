import type { AxiosResponse } from "axios";
import { productApi } from "./axios";
import type { ProductOut } from "./productService";

export interface CartItemOut {
  id: number;
  product_id: number;
  quantity: number;
  product?: ProductOut; 
}

export interface CartOut {
  id: number;
  user_id: number;
  created_at: string;
  items: CartItemOut[];
}

export const cartService = {
  getCart: (): Promise<AxiosResponse<CartOut>> =>
    productApi.get<CartOut>("/cart"),

  addItem: (product_id: number, quantity: number) =>
    productApi.post<CartOut>("/cart/items", { product_id, quantity }),

  updateItem: (product_id: number, quantity: number) =>
    productApi.put<CartOut>(`/cart/items/${product_id}`, { quantity }),

  removeItem: (product_id: number) =>
    productApi.delete<void>(`/cart/items/${product_id}`),

  clearCart: () =>
    productApi.delete<void>("/cart"),
};
