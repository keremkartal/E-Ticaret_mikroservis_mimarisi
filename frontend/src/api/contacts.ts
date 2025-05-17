import { userApi } from "./axios";
export interface Contact {
  id: number;
  category: "personal" | "business";
  type: string;
  detail: string;
}

export const listContacts = () =>
  userApi.get<Contact[]>("/users/me/contacts/");

export const createContact = (c: Omit<Contact,"id">) =>
  userApi.post<Contact>("/users/me/contacts/", c);

export const updateContact = (id: number, c: Partial<Contact>) =>
  userApi.put<Contact>(`/users/me/contacts/${id}`, c);

export const deleteContact = (id: number) =>
  userApi.delete<void>(`/users/me/contacts/${id}`);
