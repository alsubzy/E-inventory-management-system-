'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type PurchaseItemInput = {
    productId: string;
    quantity: number;
    unitCost: number;
};

export type PurchaseInput = {
    supplierId: string;
    warehouseId: string;
    date: Date;
    reference?: string; // Optional external reference
    status: 'PENDING' | 'RECEIVED' | 'COMPLETED';
    items: PurchaseItemInput[];
    notes?: string;
    paidAmount?: number;
    accountId?: string; // New: Account to pay from
};

// Auto-generate purchase number
async function generatePurchaseNumber() {
    const count = await prisma.purchase.count();
    return `PO-${(count + 1).toString().padStart(6, '0')}`;
}

export async function createPurchaseDB(data: PurchaseInput) {
    try {
        const purchaseNumber = await generatePurchaseNumber();

        // Calculate totals
        const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
        const balanceAmount = totalAmount - (data.paidAmount || 0);
        const paymentStatus = balanceAmount <= 0 ? 'PAID' : (data.paidAmount && data.paidAmount > 0 ? 'PARTIAL' : 'UNPAID');

        // Transaction: Create Purchase -> Create Items -> Update Stock -> Ledger -> Party Balance
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    purchaseNumber,
                    supplierId: data.supplierId,
                    warehouseId: data.warehouseId,
                    date: data.date,
                    status: data.status,
                    paymentStatus,
                    totalAmount,
                    netAmount: totalAmount, // Assuming no tax/discount logic complexity yet
                    paidAmount: data.paidAmount || 0,
                    balanceAmount,
                    notes: data.notes,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                            totalCost: item.quantity * item.unitCost
                        }))
                    }
                },
                include: { items: true }
            });

            // If status is RECEIVED or COMPLETED, update stock
            if (['RECEIVED', 'COMPLETED'].includes(data.status)) {
                for (const item of data.items) {
                    // 2. Update Stock (Simple approach: find first variant or create if none?)
                    // For now, assuming variants exist. If not, this might fail or be silent.
                    // TODO: Robust variant handling.
                    const firstVariant = await tx.variant.findFirst({ where: { productId: item.productId } });
                    if (firstVariant) {
                        await tx.variant.update({
                            where: { id: firstVariant.id },
                            data: { stockQuantity: { increment: item.quantity } }
                        });
                    }

                    // 3. Create Stock Ledger
                    await tx.stockLedger.create({
                        data: {
                            productId: item.productId,
                            warehouseId: data.warehouseId,
                            type: 'PURCHASE',
                            quantityChange: item.quantity,
                            referenceId: purchase.id,
                            userId: 'SYSTEM', // Should get from session
                        }
                    });
                }
            }

            // 4. Update Supplier Balance (Credit)
            // Decrease balance (Credit/Liability) for the Total Amount
            await tx.party.update({
                where: { id: data.supplierId },
                data: { currentBalance: { decrement: totalAmount } }
            });

            // If paid amount > 0, we Debit the supplier (reduce liability)
            if (data.paidAmount && data.paidAmount > 0) {
                await tx.party.update({
                    where: { id: data.supplierId },
                    data: { currentBalance: { increment: data.paidAmount } }
                });

                // 5. Update Account Balance (Withdrawal/Payment)
                if (data.accountId) {
                    await tx.account.update({
                        where: { id: data.accountId },
                        data: { balance: { decrement: data.paidAmount } }
                    });

                    // Create Payment Record (PAYMENT_MADE)
                    await tx.payment.create({
                        data: {
                            partyId: data.supplierId,
                            amount: data.paidAmount,
                            method: 'CASH',
                            type: 'PAYMENT_MADE',
                            reference: purchaseNumber,
                            date: new Date(),
                            note: `Payment for Purchase #${purchaseNumber}`,
                            accountId: data.accountId
                        }
                    });
                }
            }

            return purchase;
        });

        revalidatePath('/purchases');
        revalidatePath('/products');
        revalidatePath('/parties');
        revalidatePath('/accounts');
        return { success: true, apiData: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPurchasesDB() {
    try {
        const purchases = await prisma.purchase.findMany({
            include: {
                supplier: true,
                warehouse: true,
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, apiData: purchases };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
