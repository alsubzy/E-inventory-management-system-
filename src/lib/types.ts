export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  imageUrl: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  image?: string;
  minStock: number;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  contact: string;
  createdAt: string;
}

export interface Stock {
  productId: string;
  warehouseId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  items: TransactionItem[];
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  date: string;
  userId: string;
  reference?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  products: string[]; // Product IDs
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

