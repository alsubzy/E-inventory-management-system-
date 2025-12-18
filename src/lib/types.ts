export type UserRole = 'Admin' | 'Staff';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  image: string;
  lowStockThreshold: number;
}

export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  date: string;
}
