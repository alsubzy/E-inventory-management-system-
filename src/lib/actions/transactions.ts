"use client";

import { Transaction } from "@/lib/types";
import { transactionSchema, TransactionFormValues } from "@/lib/schemas";
import { storageManager } from "../local-storage";

export function createTransaction(data: TransactionFormValues) {
    const validated = transactionSchema.parse(data);

    const transaction: Transaction = {
        id: crypto.randomUUID(),
        ...validated,
        status: "COMPLETED",
        date: new Date().toISOString(),
        userId: 'local-user',
    };

    storageManager.createTransaction(transaction);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: `TRANSACTION_${validated.type}`,
        timestamp: new Date().toISOString(),
        details: `Created ${validated.type} transaction with ${validated.items.length} items. Reference: ${validated.reference || transaction.id}`,
    });

    return { success: true, id: transaction.id };
}

export function getTransactions() {
    return storageManager.getTransactions();
}
