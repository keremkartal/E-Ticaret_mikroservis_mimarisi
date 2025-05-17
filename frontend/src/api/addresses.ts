import { userApi } from "./axios";
export interface Address {
  id: number;
  category: "home" | "work";
  street: string;
  city: string;
  country: string;
  postal_code: string;
}

export const listAddresses = () =>
  userApi.get<Address[]>("/users/me/addresses/");

export const createAddress = (a: Omit<Address,"id">) =>
  userApi.post<Address>("/users/me/addresses/", a);

export const updateAddress = (id: number, a: Partial<Address>) =>
  userApi.put<Address>(`/users/me/addresses/${id}`, a);

export const deleteAddress = (id: number) =>
  userApi.delete<void>(`/users/me/addresses/${id}`);
