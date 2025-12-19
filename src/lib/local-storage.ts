"use client";

import { Product, Warehouse, Transaction, Stock, AuditLog, Party, PartyLedgerEntry, Payment } from "./types";

const STORAGE_KEYS = {
    PRODUCTS: "inventory_products",
    WAREHOUSES: "inventory_warehouses",
    TRANSACTIONS: "inventory_transactions",
    STOCKS: "inventory_stocks",
    AUDIT_LOGS: "inventory_audit_logs",
    PARTIES: "inventory_parties",
    LEDGERS: "inventory_ledgers",
    PAYMENTS: "inventory_payments",
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

    // Parties
    getParties() { return this.get<Party>(STORAGE_KEYS.PARTIES); }
    createParty(party: Party) { this.create(STORAGE_KEYS.PARTIES, party); }
    updateParty(id: string, data: Partial<Party>) { this.update(STORAGE_KEYS.PARTIES, id, data); }
    deleteParty(id: string) { this.delete(STORAGE_KEYS.PARTIES, id); }

    // Ledgers
    getLedgers(partyId?: string) {
        const all = this.get<PartyLedgerEntry>(STORAGE_KEYS.LEDGERS);
        return partyId ? all.filter(l => l.partyId === partyId) : all;
    }

    private createLedgerEntry(entry: PartyLedgerEntry) {
        this.create(STORAGE_KEYS.LEDGERS, entry);
        // Update party current balance
        const parties = this.getParties();
        const partyIndex = parties.findIndex(p => p.id === entry.partyId);
        if (partyIndex !== -1) {
            const amount = entry.type === 'DEBIT' ? entry.amount : -entry.amount;
            parties[partyIndex].currentBalance += amount;
            parties[partyIndex].updatedAt = new Date().toISOString();
            this.set(STORAGE_KEYS.PARTIES, parties);
        }
    }

    // Payments
    getPayments(partyId?: string) {
        const all = this.get<Payment>(STORAGE_KEYS.PAYMENTS);
        return partyId ? all.filter(p => p.partyId === partyId) : all;
    }

    processPayment(payment: Payment) {
        this.create(STORAGE_KEYS.PAYMENTS, payment);

        // Create ledger entry
        const parties = this.getParties();
        const party = parties.find(p => p.id === payment.partyId);
        if (party) {
            const entry: PartyLedgerEntry = {
                id: Math.random().toString(36).substr(2, 9),
                partyId: payment.partyId,
                paymentId: payment.id,
                date: payment.date,
                description: `Payment ${payment.type.replace('_', ' ')} (${payment.method})`,
                type: payment.type === 'PAYMENT_RECEIVED' ? 'CREDIT' : 'DEBIT',
                amount: payment.amount,
                runningBalance: party.currentBalance + (payment.type === 'PAYMENT_RECEIVED' ? -payment.amount : payment.amount)
            };
            this.createLedgerEntry(entry);
        }
    }

    // Transactions
    getTransactions() { return this.get<Transaction>(STORAGE_KEYS.TRANSACTIONS); }
    createTransaction(transaction: Transaction) {
        this.create(STORAGE_KEYS.TRANSACTIONS, transaction);
        this.updateStockFromTransaction(transaction);

        if (transaction.partyId) {
            this.updateLedgerFromTransaction(transaction);
        }
    }

    private updateLedgerFromTransaction(transaction: Transaction) {
        const parties = this.getParties();
        const party = parties.find(p => p.id === transaction.partyId);
        if (!party) return;

        const amount = transaction.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const type: 'DEBIT' | 'CREDIT' = transaction.type === 'IN' ? 'CREDIT' : 'DEBIT'; // Purchase = Credit (Payable), Sale = Debit (Receivable)

        const entry: PartyLedgerEntry = {
            id: Math.random().toString(36).substr(2, 9),
            partyId: transaction.partyId,
            transactionId: transaction.id,
            date: transaction.date,
            description: `${transaction.type} Transaction ${transaction.reference || transaction.id}`,
            type,
            amount,
            runningBalance: party.currentBalance + (type === 'DEBIT' ? amount : -amount)
        };
        this.createLedgerEntry(entry);
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
