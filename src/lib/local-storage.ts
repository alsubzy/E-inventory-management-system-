"use client";

import { Product, Warehouse, Transaction, Stock, AuditLog } from "./types";

const STORAGE_KEYS = {
    PRODUCTS: "inventory_products",
    WAREHOUSES: "inventory_warehouses",
    TRANSACTIONS: "inventory_transactions",
    STOCKS: "inventory_stocks",
    AUDIT_LOGS: "inventory_audit_logs",
};

class LocalStorageManager {
    private isBrowser = typeof window !== "undefined";

    private get<T>(key: string): T[] {
        if (!this.isBrowser) return [];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private set<T>(key: string, data: T[]) {
        if (!this.isBrowser) return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Generic CRUD
    private create<T extends { id: string }>(key: string, item: T) {
        const items = this.get<T>(key);
        items.push(item);
        this.set(key, items);
    }

    private update<T extends { id: string }>(key: string, id: string, data: Partial<T>) {
        const items = this.get<T>(key);
        const index = items.findIndex((i) => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            this.set(key, items);
        }
    }

    private delete(key: string, id: string) {
        const items = this.get<{ id: string }>(key);
        this.set(key, items.filter((i) => i.id !== id));
    }

    // Products
    getProducts() { return this.get<Product>(STORAGE_KEYS.PRODUCTS); }
    createProduct(product: Product) { this.create(STORAGE_KEYS.PRODUCTS, product); }
    updateProduct(id: string, data: Partial<Product>) { this.update(STORAGE_KEYS.PRODUCTS, id, data); }
    deleteProduct(id: string) { this.delete(STORAGE_KEYS.PRODUCTS, id); }

    // Warehouses
    getWarehouses() { return this.get<Warehouse>(STORAGE_KEYS.WAREHOUSES); }
    createWarehouse(warehouse: Warehouse) { this.create(STORAGE_KEYS.WAREHOUSES, warehouse); }
    updateWarehouse(id: string, data: Partial<Warehouse>) { this.update(STORAGE_KEYS.WAREHOUSES, id, data); }
    deleteWarehouse(id: string) { this.delete(STORAGE_KEYS.WAREHOUSES, id); }

    // Transactions
    getTransactions() { return this.get<Transaction>(STORAGE_KEYS.TRANSACTIONS); }
    createTransaction(transaction: Transaction) {
        this.create(STORAGE_KEYS.TRANSACTIONS, transaction);
        this.updateStockFromTransaction(transaction);
    }

    // Stocks
    getStocks() { return this.get<Stock>(STORAGE_KEYS.STOCKS); }

    private updateStockFromTransaction(transaction: Transaction) {
        const stocks = this.getStocks();

        transaction.items.forEach(item => {
            if (transaction.type === 'IN' && transaction.toWarehouseId) {
                this.adjustStock(stocks, item.productId, transaction.toWarehouseId, item.quantity);
            } else if (transaction.type === 'OUT' && transaction.fromWarehouseId) {
                this.adjustStock(stocks, item.productId, transaction.fromWarehouseId, -item.quantity);
            } else if (transaction.type === 'TRANSFER' && transaction.fromWarehouseId && transaction.toWarehouseId) {
                this.adjustStock(stocks, item.productId, transaction.fromWarehouseId, -item.quantity);
                this.adjustStock(stocks, item.productId, transaction.toWarehouseId, item.quantity);
            }
        });

        this.set(STORAGE_KEYS.STOCKS, stocks);
    }

    private adjustStock(stocks: Stock[], productId: string, warehouseId: string, quantity: number) {
        const stockIndex = stocks.findIndex(s => s.productId === productId && s.warehouseId === warehouseId);
        if (stockIndex !== -1) {
            stocks[stockIndex].quantity += quantity;
            stocks[stockIndex].updatedAt = new Date().toISOString();
        } else {
            stocks.push({
                productId,
                warehouseId,
                quantity,
                updatedAt: new Date().toISOString()
            });
        }
    }

    // Audit Logs
    getAuditLogs() { return this.get<AuditLog>(STORAGE_KEYS.AUDIT_LOGS); }
    createAuditLog(log: AuditLog) { this.create(STORAGE_KEYS.AUDIT_LOGS, log); }
}

export const storageManager = new LocalStorageManager();
