"use client";

import { storageManager } from "../local-storage";

export function getStockLevels() {
    const stocks = storageManager.getStocks();
    const products = storageManager.getProducts();

    // Aggregate stock by product
    const stockMap: Record<string, number> = {};
    stocks.forEach(s => {
        stockMap[s.productId] = (stockMap[s.productId] || 0) + s.quantity;
    });

    return products.map(p => ({
        ...p,
        totalQuantity: stockMap[p.id] || 0,
        isLowStock: (stockMap[p.id] || 0) < p.minStock,
    }));
}

export function getDashboardStats() {
    const stockLevels = getStockLevels();
    const transactions = storageManager.getTransactions();

    const totalProducts = stockLevels.length;
    const lowStockCount = stockLevels.filter(s => s.isLowStock).length;

    const totalStockValue = stockLevels.reduce((acc, curr) => acc + (curr.totalQuantity * curr.costPrice), 0);

    const totalRevenue = transactions
        .filter(t => t.type === 'OUT' && t.status === 'COMPLETED')
        .reduce((acc, curr) => acc + curr.items.reduce((sum, item) => sum + (item.quantity * item.price), 0), 0);

    return {
        totalProducts,
        lowStockCount,
        totalStockValue,
        totalRevenue,
        recentTransactions: [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        lowStockItems: stockLevels.filter(s => s.isLowStock).slice(0, 5),
    };
}
