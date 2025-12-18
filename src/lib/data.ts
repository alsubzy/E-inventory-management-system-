import type { Product, Sale, User } from './types';

export const mockUser: User = {
  name: 'Admin User',
  email: 'admin@stockpilot.com',
  role: 'Admin',
  avatar: 'https://i.pravatar.cc/150?u=admin@stockpilot.com',
};

export const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Wireless Mouse',
    sku: 'WM-1023',
    category: 'Electronics',
    costPrice: 12.5,
    sellingPrice: 24.99,
    quantity: 150,
    image: 'https://picsum.photos/seed/1/400/400',
    lowStockThreshold: 20,
  },
  {
    id: 'prod_002',
    name: 'Ergonomic Keyboard',
    sku: 'EK-4590',
    category: 'Electronics',
    costPrice: 45.0,
    sellingPrice: 79.99,
    quantity: 8,
    image: 'https://picsum.photos/seed/2/400/400',
    lowStockThreshold: 10,
  },
  {
    id: 'prod_003',
    name: 'USB-C Hub',
    sku: 'UC-H801',
    category: 'Accessories',
    costPrice: 20.0,
    sellingPrice: 39.99,
    quantity: 120,
    image: 'https://picsum.photos/seed/3/400/400',
    lowStockThreshold: 15,
  },
  {
    id: 'prod_004',
    name: '4K Monitor',
    sku: 'MON-4K-27',
    category: 'Electronics',
    costPrice: 250.0,
    sellingPrice: 449.99,
    quantity: 45,
    image: 'https://picsum.photos/seed/4/400/400',
    lowStockThreshold: 10,
  },
  {
    id: 'prod_005',
    name: 'Standing Desk',
    sku: 'SD-ELE-01',
    category: 'Furniture',
    costPrice: 180.0,
    sellingPrice: 349.99,
    quantity: 30,
    image: 'https://picsum.photos/seed/5/400/400',
    lowStockThreshold: 5,
  },
  {
    id: 'prod_006',
    name: 'Laptop Stand',
    sku: 'LS-ALU-02',
    category: 'Accessories',
    costPrice: 15.0,
    sellingPrice: 29.99,
    quantity: 200,
    image: 'https://picsum.photos/seed/6/400/400',
    lowStockThreshold: 25,
  },
];

export const mockSales: Sale[] = [
  { id: 'sale_001', productName: 'Wireless Mouse', quantity: 2, total: 49.98, date: '2024-05-20T10:30:00Z' },
  { id: 'sale_002', productName: 'Ergonomic Keyboard', quantity: 1, total: 79.99, date: '2024-05-20T11:05:00Z' },
  { id: 'sale_003', productName: 'USB-C Hub', quantity: 3, total: 119.97, date: '2024-05-19T14:00:00Z' },
  { id: 'sale_004', productName: '4K Monitor', quantity: 1, total: 449.99, date: '2024-05-19T16:20:00Z' },
  { id: 'sale_005', productName: 'Laptop Stand', quantity: 5, total: 149.95, date: '2024-05-18T09:15:00Z' },
];

// Generate more sales data for charts
const today = new Date();
const generateSalesForPastDays = (days: number) => {
  const sales: { date: string; sales: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    sales.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Math.floor(Math.random() * (5000 - 1000 + 1) + 1000),
    });
  }
  return sales;
};

export const salesByDay = generateSalesForPastDays(30);

export const topSellingProducts = mockProducts
  .slice(0, 5)
  .map(p => ({
    name: p.name,
    sold: Math.floor(Math.random() * (200 - 50 + 1)) + 50,
  }))
  .sort((a, b) => b.sold - a.sold);
