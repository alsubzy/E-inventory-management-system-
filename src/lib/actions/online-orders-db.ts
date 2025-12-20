'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOnlineOrdersDB() {
    try {
        const orders = await prisma.onlineOrder.findMany({
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, apiData: orders };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getOnlineOrderDB(id: string) {
    try {
        const order = await prisma.onlineOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        if (!order) return { success: false, error: "Order not found" };
        return { success: true, apiData: order };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Admin Action: Update Status
export async function updateOnlineOrderStatusDB(id: string, status: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.onlineOrder.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!order) throw new Error("Order not found");

            // Prevent redundant updates
            if (order.status === status) return order;

            // Logic for Stock Reservation / Deduction
            // When moving to CONFIRMED or SHIPPED, deduct stock if not already done?
            // "Stock reservation" usually happens at PENDING or CONFIRMED.
            // Let's assume PENDING doesn't touch stock (or soft reservation).
            // CONFIRMED touches stock?
            // Let's simplify:
            // If status becomes SHIPPED/DELIVERED/CONFIRMED from PENDING/CANCELLED -> Decrease Stock
            // If status becomes CANCELLED from SHIPPED/CONFIRMED -> Increase Stock

            const isActiveState = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];
            const wasActiveState = isActiveState.includes(order.status);
            const willBeActiveState = isActiveState.includes(status);

            // Deduct Stock
            if (!wasActiveState && willBeActiveState) {
                for (const item of order.items) {
                    // Update main product stock or variant? 
                    // Again, issue with Variant. Assuming Product has stock linked somehow or just ledger.
                    // We will create specific Ledger entry for "ONLINE_SALE"

                    // Simple: Update first variant stock
                    const firstVariant = await tx.variant.findFirst({ where: { productId: item.productId } });
                    if (firstVariant) {
                        await tx.variant.update({
                            where: { id: firstVariant.id },
                            data: { stockQuantity: { decrement: item.quantity } }
                        });
                    }

                    // Ledger
                    await tx.stockLedger.create({
                        data: {
                            productId: item.productId,
                            // Warehouse? Need default warehouse for online orders.
                            // Assuming first warehouse for now. TODO: Settings for default warehouse.
                            warehouseId: (await tx.warehouse.findFirst())?.id || '',
                            type: 'SALE', // or ONLINE_SALE
                            quantityChange: -item.quantity,
                            referenceId: order.id,
                            userId: 'SYSTEM',
                            note: `Online Order ${order.orderNumber}`
                        }
                    });
                }
            }

            // Restore Stock
            if (wasActiveState && !willBeActiveState) { // e.g., Cancelled
                for (const item of order.items) {
                    const firstVariant = await tx.variant.findFirst({ where: { productId: item.productId } });
                    if (firstVariant) {
                        await tx.variant.update({
                            where: { id: firstVariant.id },
                            data: { stockQuantity: { increment: item.quantity } }
                        });
                    }
                    await tx.stockLedger.create({
                        data: {
                            productId: item.productId,
                            warehouseId: (await tx.warehouse.findFirst())?.id || '',
                            type: 'RETURN', // Restock
                            quantityChange: item.quantity,
                            referenceId: order.id,
                            userId: 'SYSTEM',
                            note: `Online Order Cancelled ${order.orderNumber}`
                        }
                    });
                }
            }

            return await tx.onlineOrder.update({
                where: { id },
                data: { status }
            });
        });

        revalidatePath('/online-orders');
        revalidatePath(`/online-orders/${id}`);
        return { success: true, apiData: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// For Testing: Manual Create
export async function createOnlineOrderDB(data: any) {
    try {
        const count = await prisma.onlineOrder.count();
        const orderNumber = `ORD-${(count + 1).toString().padStart(6, '0')}`;

        const order = await prisma.onlineOrder.create({
            data: {
                orderNumber,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                shippingAddress: data.shippingAddress,
                totalAmount: data.totalAmount,
                status: 'PENDING',
                items: {
                    create: data.items.map((i: any) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        totalPrice: i.quantity * i.unitPrice
                    }))
                }
            }
        });
        revalidatePath('/online-orders');
        return { success: true, apiData: order };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
