// frontend/src/api/userService.ts
import { userApi } from "./axios";
import type { AxiosResponse } from "axios";

export interface UserOut {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  must_change: number;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  is_active?: boolean;
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  username: string;
  email: string;
}

export interface UserForgotPasswordResponse {
  detail: string;
}

export interface AdminResetPasswordResponse {
  detail: string;
  temporary_password_is_email?: string;
}

export interface ContactSchema {
  id: number;
  user_id: number;
  category: "Ev" | "İş";
  type: string;
  detail: string;
}
export interface UserAdminDTO {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles?: string[];
  must_change?: number;
}
export interface AddressSchema {
  id: number;
  user_id: number;
  category: "home" | "work";
  street: string;
  city: string;
  country: string;
  postal_code: string;
}

export const userService = {
  checkLogin: () => userApi.get<{ valid: boolean }>("/auth/checkLogin"),
  getMe: () => userApi.get<UserOut>("/users/me"),
  updateMe: (data: UserUpdate) => userApi.put<UserOut>("/users/me", data),
  changePassword: (data: PasswordChange) => userApi.put<void>("/users/me/password", data),
  deactivateSelf: () => userApi.delete<void>("/users/me"),
  forgotPassword: (data: ForgotPasswordRequest) =>
    userApi.post<UserForgotPasswordResponse>("/users/forgot-password", data),
  getMyRoles: () => userApi.get<string[]>("/authz/roles"),
  getMyPermissions: () => userApi.get<string[]>("/authz/permissions"),
  hasRole: (role: string) => userApi.get<{ hasRole: boolean }>(`/authz/hasRole/${role}`),
  hasPermission: (perm: string) => userApi.get<{ hasPermission: boolean }>(`/authz/hasPermission/${perm}`),
  getContacts: () => userApi.get<ContactSchema[]>("/users/me/contacts"),
  addContact: (data: Omit<ContactSchema, "id" | "user_id">) =>
    userApi.post<ContactSchema>("/users/me/contacts", data),
  updateContact: (id: number, data: Partial<Omit<ContactSchema, "id" | "user_id">>) =>
    userApi.put<ContactSchema>(`/users/me/contacts/${id}`, data),
  deleteContact: (id: number) =>
    userApi.delete<void>(`/users/me/contacts/${id}`),
  getAddresses: () => userApi.get<AddressSchema[]>("/users/me/addresses"),
  addAddress: (data: Omit<AddressSchema, "id" | "user_id">) =>
    userApi.post<AddressSchema>("/users/me/addresses", data),
  updateAddress: (id: number, data: Partial<Omit<AddressSchema, "id" | "user_id">>) =>
    userApi.put<AddressSchema>(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: number) =>
    userApi.delete<void>(`/users/me/addresses/${id}`),
};

export const adminService = {
  listUsers: () => userApi.get<UserAdminDTO[]>("/users"),
  getUser: (id: number) => userApi.get<UserAdminDTO>(`/users/${id}`),
  createUser: (u: { username: string; email: string; password: string }) =>
    userApi.post<UserAdminDTO>("/users", u),
  updateUser: (id: number, body: Partial<Omit<UserAdminDTO, "id" | "roles">>) =>
    userApi.put<UserAdminDTO>(`/users/${id}`, body),
  deactivateUser: (id: number) => userApi.delete<void>(`/users/${id}`),
  activateUser: (id: number) =>
    userApi.put<UserAdminDTO>(`/users/${id}/activate`, {}),
  listPasswordRequests: () =>
    userApi.get<UserOut[]>("/users/password-requests"),
  adminSetUserPasswordToEmail: (uid: number) =>
    userApi.post<AdminResetPasswordResponse>(`/users/${uid}/admin-set-email-password`, {}),
  setUserRoles: (userId: number, roleIds: number[]): Promise<AxiosResponse<UserOut>> =>
    userApi.put<UserOut>(`/users/${userId}/roles`, roleIds),
};