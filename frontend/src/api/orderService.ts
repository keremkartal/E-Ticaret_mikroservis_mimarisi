import { productApi } from "./axios";
import type { AxiosResponse } from "axios";

export interface OrderItemOut {
  id: number;
  product_id: number;
  quantity: number;
  price_at_order: string;  // Numeric as string
  product?: {
    id: number;
    name: string;
    price: string;
  };
}

export interface OrderOut {
  id: number;
  user_id: number;
  address_id: number | null;
  total_amount: string;
  status: string;
  created_at: string;
  street: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  items: OrderItemOut[];
}

export interface OrderCreate {
  address_id: number;
}

export const orderService = {
  placeOrder: (data: OrderCreate): Promise<AxiosResponse<OrderOut>> =>
    productApi.post<OrderOut>("/orders", data),

  listOrders: (skip = 0, limit = 100) =>
    productApi.get<OrderOut[]>("/orders", { params: { skip, limit } }),

  getOrder: (id: number) =>
    productApi.get<OrderOut>(`/orders/${id}`),
};
