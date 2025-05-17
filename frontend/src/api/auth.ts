import { userApi } from "./axios";

export interface MeResponse {
  id: number;
  username: string;
  email: string;
  // eğer backend dönerse addresses ve contacts dizileri de
}

export const getMe = () => userApi.get<MeResponse>("/authz/me");
export const getMyRoles = () => userApi.get<string[]>("/authz/roles");
export const getMyPerms = () => userApi.get<string[]>("/authz/permissions");
