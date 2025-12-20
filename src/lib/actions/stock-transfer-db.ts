'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type StockTransferItemInput = {
    productId: string;
    quantity: number;
};

export type StockTransferInput = {
    sourceWarehouseId: string;
    destWarehouseId: string;
    date: Date;
    items: StockTransferItemInput[];
    notes?: string;
    status: 'COMPLETED' | 'CANCELLED'; // simplified for now
};

async function generateTransferNumber() {
    const count = await prisma.stockTransfer.count();
    return `TR-${(count + 1).toString().padStart(6, '0')}`;
}

export async function createStockTransferDB(data: StockTransferInput) {
    try {
        if (data.sourceWarehouseId === data.destWarehouseId) {
            throw new Error("Source and Destination warehouses cannot be the same.");
        }

        const transferNumber = await generateTransferNumber();

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Transfer Record
            const transfer = await tx.stockTransfer.create({
                data: {
                    transferNumber,
                    sourceWarehouseId: data.sourceWarehouseId,
                    destWarehouseId: data.destWarehouseId,
                    date: data.date,
                    status: data.status,
                    notes: data.notes,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity
                        }))
                    }
                },
                include: { items: true }
            });

            if (data.status === 'COMPLETED') {
                for (const item of data.items) {
                    // 2. Create Stock Ledger OUT (Source)
                    await tx.stockLedger.create({
                        data: {
                            productId: item.productId,
                            warehouseId: data.sourceWarehouseId,
                            type: 'TRANSFER',
                            quantityChange: -item.quantity, // Negative for OUT
                            referenceId: transfer.id,
                            userId: 'SYSTEM',
                            note: `Transfer Out to ${data.destWarehouseId}` // Should ideally resolve warehouse name but ID is fine for now or join later
                        }
                    });

                    // 3. Create Stock Ledger IN (Destination)
                    await tx.stockLedger.create({
                        data: {
                            productId: item.productId,
                            warehouseId: data.destWarehouseId,
                            type: 'TRANSFER',
                            quantityChange: item.quantity, // Positive for IN
                            referenceId: transfer.id,
                            userId: 'SYSTEM',
                            note: `Transfer In from ${data.sourceWarehouseId}`
                        }
                    });

                    // Note: Global stock (Variant.stockQuantity) does not change for transfers.
                    // If we were tracking per-warehouse stock in a separate table, we would update it here.
                }
            }

            return transfer;
        });

        revalidatePath('/stock-transfers');
        revalidatePath('/dashboard');
        return { success: true, apiData: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStockTransfersDB() {
    try {
        const transfers = await prisma.stockTransfer.findMany({
            include: {
                sourceWarehouse: true,
                destWarehouse: true,
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, apiData: transfers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStockTransferIdsDB() {
    try {
        const transfers = await prisma.stockTransfer.findMany({ select: { id: true } });
        return { success: true, ids: transfers.map(t => t.id) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
