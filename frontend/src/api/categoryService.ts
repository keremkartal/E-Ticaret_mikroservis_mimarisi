// frontend/src/api/categoryService.ts
import { productApi } from "./axios"; // productApi'nin doğru import edildiğini varsayıyoruz
import type { AxiosResponse } from "axios";

export interface CategoryOut {
  id: number;
  name: string;
  description?: string | null; // Backend şemasıyla uyumlu
}

// YENİ EKLENDİ: Yeni kategori oluşturmak için gönderilecek veri tipi
export interface CategoryCreate {
  name: string;
  description?: string | null;
}

export const categoryService = {
  listCategories: (): Promise<AxiosResponse<CategoryOut[]>> => 
    productApi.get<CategoryOut[]>("/categories"),

  // YENİ EKLENEN FONKSİYON: Yeni kategori oluştur
  createCategory: (data: CategoryCreate): Promise<AxiosResponse<CategoryOut>> =>
    productApi.post<CategoryOut>("/categories", data),

  
};