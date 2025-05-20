import { productApi } from "./axios"; 
import type { AxiosResponse } from "axios";

export interface CategoryOut {
  id: number;
  name: string;
  description?: string | null; 
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
}

export const categoryService = {
  listCategories: (): Promise<AxiosResponse<CategoryOut[]>> => 
    productApi.get<CategoryOut[]>("/categories"),

  createCategory: (data: CategoryCreate): Promise<AxiosResponse<CategoryOut>> =>
    productApi.post<CategoryOut>("/categories", data),

  
};