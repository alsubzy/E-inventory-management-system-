"use client";

import { storageManager } from "../local-storage";
import { getStockLevels } from "./analytics";

export function getInventoryReportData() {
    const stockLevels = getStockLevels();

    return stockLevels.map(s => ({
        SKU: s.sku,
        Name: s.name,
        Category: s.category,
        Unit: s.unit,
        CostPrice: s.costPrice,
        SellingPrice: s.sellingPrice,
        AvailableQuantity: s.totalQuantity,
        StockValue: s.totalQuantity * s.costPrice,
        PotentialRevenue: s.totalQuantity * s.sellingPrice,
    }));
}

export function getSalesReportData() {
    const transactions = storageManager.getTransactions().filter(t => t.type === 'OUT' && t.status === 'COMPLETED');

    // Flatten items for reporting
    const report = [];
    for (const t of transactions) {
        for (const item of t.items) {
            report.push({
                Date: t.date,
                Reference: t.reference || t.id,
                ProductId: item.productId,
                Quantity: item.quantity,
                UnitPrice: item.price,
                Total: item.quantity * item.price,
            });
        }
    }
    return report;
}
