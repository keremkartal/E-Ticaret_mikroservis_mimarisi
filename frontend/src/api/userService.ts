// frontend/src/api/userService.ts
import { userApi } from "./axios";
import type { AxiosResponse } from "axios";

export interface UserOut {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[]; // EKLENDİ: Backend'deki UserOut ile eşleşmesi için
  must_change: number;
}

export interface UserUpdate {
  username?: string; // Opsiyonel yapıldı
  email?: string;    // Opsiyonel yapıldı
  is_active?: boolean; // Opsiyonel yapıldı
}

export interface PasswordChange {
  old_password: string;
  new_password: string;
}
export interface ResetPasswordResponse { // Bu interface'i kullanıyorsanız kalsın
  detail: string;
  new_password?: string; // Opsiyonel olabilir
}

export interface ForgotPasswordRequest {
  username: string;
  email: string;
}
export interface ForgotPasswordResponse {
  detail: string;
  temporary_password?: string;
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
  getMe:             () => userApi.get<UserOut>("/authz/me"), // Artık güncellenmiş UserOut kullanacak
  updateMe:          (data: UserUpdate) => userApi.put<UserOut>("/users/me", data),
  changePassword:    (data: PasswordChange) => userApi.put<void>("/users/me/password", data),
  deactivateSelf:    () => userApi.delete<void>("/users/me"),
  getMyRoles:        () => userApi.get<string[]>("/authz/roles"),
  getMyPermissions:  () => userApi.get<string[]>("/authz/permissions"),
  hasRole:           (role: string) => userApi.get<{ hasRole: boolean }>(`/authz/hasRole/${role}`),
  hasPermission:     (perm: string) => userApi.get<{ hasPermission: boolean }>(`/authz/hasPermission/${perm}`),
  forgotPassword: (data: ForgotPasswordRequest) =>
    userApi.post<ForgotPasswordResponse>("/users/forgot-password", data),
  
  getContacts:    () => userApi.get<ContactSchema[]>("/users/me/contacts"),
  addContact:     (data: Omit<ContactSchema, "id" | "user_id">) =>userApi.post<ContactSchema>("/users/me/contacts", data),
  updateContact:  (id: number, data: Partial<Omit<ContactSchema, "id" | "user_id">>) =>
                    userApi.put<ContactSchema>(`/users/me/contacts/${id}`, data),
  deleteContact:  (id: number) =>
                    userApi.delete<void>(`/users/me/contacts/${id}`),
  createUser:  (u:{username:string;email:string;password:string}) =>
                 userApi.post<UserAdminDTO>("/users",u),
  getAddresses:   () => userApi.get<AddressSchema[]>("/users/me/addresses"),
  addAddress:     (data: Omit<AddressSchema, "id" | "user_id">) =>
                    userApi.post<AddressSchema>("/users/me/addresses", data),
  updateAddress:  (id: number, data: Partial<Omit<AddressSchema, "id" | "user_id">>) =>
                    userApi.put<AddressSchema>(`/users/me/addresses/${id}`, data),
  deleteAddress:  (id: number) =>
                    userApi.delete<void>(`/users/me/addresses/${id}`),
};

export const adminService = {
  listUsers:   () => userApi.get<UserAdminDTO[]>("/users"),
  getUser:     (id:number) => userApi.get<UserAdminDTO>(`/users/${id}`),
  createUser:  (u:{username:string;email:string;password:string}) =>
                 userApi.post<UserAdminDTO>("/users",u),
  updateUser:  (id:number, body:Partial<Omit<UserAdminDTO,"id" | "roles">>) => // roller buradan güncellenmemeli
                 userApi.put<UserAdminDTO>(`/users/${id}`,body),
  deactivate:  (id:number) => userApi.delete<void>(`/users/${id}`),
  
  listPasswordRequests: () =>
    userApi.get<UserOut[]>("/users/password-requests"), // Artık güncellenmiş UserOut kullanacak

  resetUserPassword: (uid: number) =>
    userApi.post<ForgotPasswordResponse>(`/users/${uid}/reset-password`),
  activateUser: (id: number) =>
    userApi.put<UserAdminDTO>(`/users/${id}/activate`, {}),

  setUserRoles: (userId: number, roleIds: number[]): Promise<AxiosResponse<UserOut>> =>
    userApi.put<UserOut>(`/users/${userId}/roles`, roleIds),
};
