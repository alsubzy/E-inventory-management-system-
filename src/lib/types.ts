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

export type PartyType = 'SUPPLIER' | 'CUSTOMER' | 'BOTH';
export type BalanceType = 'DEBIT' | 'CREDIT';
export type PaymentTerms = 'CASH' | 'CREDIT' | 'NET_DAYS';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  phone: string;
  email: string;
  address: string;
  openingBalance: number;
  balanceType: BalanceType;
  currentBalance: number;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface PartyLedgerEntry {
  id: string;
  partyId: string;
  transactionId?: string;
  paymentId?: string;
  date: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  runningBalance: number;
}

export interface Payment {
  id: string;
  partyId: string;
  amount: number;
  method: 'CASH' | 'BANK' | 'MOBILE_MONEY';
  type: 'PAYMENT_MADE' | 'PAYMENT_RECEIVED' | 'ADVANCE';
  reference?: string;
  date: string;
  note?: string;
}

export interface Transaction {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  items: TransactionItem[];
  fromWarehouseId?: string;
  toWarehouseId?: string;
  partyId?: string; // Linked Party
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  date: string;
  userId: string;
  reference?: string;
}

export type SalesStatus = 'COMPLETED' | 'CANCELLED' | 'RETURNED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string;
  warehouseId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  status: SalesStatus;
  userId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  saleId: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
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

