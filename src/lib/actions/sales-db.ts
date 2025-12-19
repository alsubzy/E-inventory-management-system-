"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { SalesStatus, PaymentStatus } from "@/lib/types"

export async function createSaleDB(data: {
    customerId: string
    warehouseId: string
    totalAmount: number
    discountAmount: number
    taxAmount: number
    netAmount: number
    paidAmount: number
    notes?: string
    items: {
        productId: string
        variantId?: string
        quantity: number
        unitPrice: number
        discountAmount: number
        taxAmount: number
        totalAmount: number
    }[]
}) {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Unauthorized' }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Validate stock for each item
            for (const item of data.items) {
                const stock = await tx.stockLedger.aggregate({
                    where: {
                        productId: item.productId,
                        variantId: item.variantId || null,
                        warehouseId: data.warehouseId
                    },
                    _sum: { quantityChange: true }
                })
                const currentStock = stock._sum.quantityChange || 0
                if (currentStock < item.quantity) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } })
                    throw new Error(`Insufficient stock for product: ${product?.name}`)
                }
            }

            // 2. Generate sale number (simple format: S-DATE-RANDOM)
            const saleNumber = `S-${new Date().getTime().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

            // 3. Determine payment status
            let paymentStatus: PaymentStatus = 'UNPAID'
            if (data.paidAmount >= data.netAmount) paymentStatus = 'PAID'
            else if (data.paidAmount > 0) paymentStatus = 'PARTIAL'

            const balanceAmount = data.netAmount - data.paidAmount

            // 4. Create Sale record
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    customerId: data.customerId,
                    warehouseId: data.warehouseId,
                    totalAmount: data.totalAmount,
                    discountAmount: data.discountAmount,
                    taxAmount: data.taxAmount,
                    netAmount: data.netAmount,
                    paidAmount: data.paidAmount,
                    balanceAmount,
                    paymentStatus,
                    status: 'COMPLETED',
                    userId,
                    notes: data.notes,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            variantId: item.variantId || null,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discountAmount: item.discountAmount,
                            taxAmount: item.taxAmount,
                            totalAmount: item.totalAmount
                        }))
                    }
                },
                include: { items: true }
            })

            // 5. Update Stock Ledger for each item
            for (const item of data.items) {
                await tx.stockLedger.create({
                    data: {
                        productId: item.productId,
                        variantId: item.variantId || null,
                        warehouseId: data.warehouseId,
                        quantityChange: -item.quantity, // Reduction
                        type: 'SALE',
                        referenceId: sale.id,
                        userId,
                        note: `Sale #${saleNumber}`
                    }
                })
            }

            // 6. Update Party Balance and Ledger (Customer)
            const party = await tx.party.findUnique({
                where: { id: data.customerId },
                select: { currentBalance: true }
            })

            if (party) {
                // If it's a credit sale (balance > 0), it increases the customer's DEBIT balance (they owe us)
                // In this system, DEBIT is positive, CREDIT is negative.
                const balanceChange = data.netAmount - data.paidAmount
                const newBalance = party.currentBalance + balanceChange

                await tx.partyLedger.create({
                    data: {
                        partyId: data.customerId,
                        transactionId: sale.id,
                        date: new Date(),
                        description: `Sale #${saleNumber}`,
                        type: 'DEBIT',
                        amount: data.netAmount,
                        runningBalance: party.currentBalance + data.netAmount
                    }
                })

                if (data.paidAmount > 0) {
                    await tx.partyLedger.create({
                        data: {
                            partyId: data.customerId,
                            transactionId: sale.id,
                            date: new Date(),
                            description: `Payment for Sale #${saleNumber}`,
                            type: 'CREDIT',
                            amount: data.paidAmount,
                            runningBalance: party.currentBalance + data.netAmount - data.paidAmount
                        }
                    })
                }

                await tx.party.update({
                    where: { id: data.customerId },
                    data: { currentBalance: newBalance }
                })
            }

            // 7. Create Invoice
            const invoiceNumber = `INV-${saleNumber.split('-')[1]}-${saleNumber.split('-')[2]}`
            await tx.invoice.create({
                data: {
                    saleId: sale.id,
                    invoiceNumber,
                    totalAmount: data.netAmount
                }
            })

            return sale
        })

        revalidatePath('/sales')
        revalidatePath('/products')
        revalidatePath('/parties')
        return { success: true, sale: result }
    } catch (error: any) {
        console.error('Error creating sale:', error)
        return { success: false, error: error.message || 'Failed to create sale' }
    }
}

export async function getSalesDB(filters?: {
    customerId?: string
    status?: SalesStatus
    paymentStatus?: PaymentStatus
    startDate?: Date
    endDate?: Date
}) {
    try {
        const where: any = {}
        if (filters?.customerId) where.customerId = filters.customerId
        if (filters?.status) where.status = filters.status
        if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {}
            if (filters.startDate) where.createdAt.gte = filters.startDate
            if (filters.endDate) where.createdAt.lte = filters.endDate
        }

        const sales = await prisma.sale.findMany({
            where,
            include: {
                customer: true,
                items: { include: { product: true } },
                invoice: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, sales }
    } catch (error) {
        console.error('Error fetching sales:', error)
        return { success: false, error: 'Failed to fetch sales', sales: [] }
    }
}

export async function getSaleByIdDB(id: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true, variant: true } },
                invoice: true
            }
        })
        if (!sale) return { success: false, error: 'Sale not found' }
        return { success: true, sale }
    } catch (error) {
        console.error('Error fetching sale:', error)
        return { success: false, error: 'Failed to fetch sale' }
    }
}

export async function cancelSaleDB(id: string) {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Unauthorized' }

        const result = await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { items: true }
            })

            if (!sale) throw new Error('Sale not found')
            if (sale.status === 'CANCELLED') throw new Error('Sale already cancelled')

            // 1. Update Sale Status
            await tx.sale.update({
                where: { id },
                data: { status: 'CANCELLED' }
            })

            // 2. Revert Stock
            for (const item of sale.items) {
                await tx.stockLedger.create({
                    data: {
                        productId: item.productId,
                        variantId: item.variantId,
                        warehouseId: sale.warehouseId,
                        quantityChange: item.quantity, // Addition back to stock
                        type: 'RETURN',
                        referenceId: sale.id,
                        userId,
                        note: `Cancelled Sale #${sale.saleNumber}`
                    }
                })
            }

            // 3. Revert Party Balance (Customer)
            const party = await tx.party.findUnique({
                where: { id: sale.customerId },
                select: { currentBalance: true }
            })

            if (party) {
                const balanceChange = -(sale.netAmount - sale.paidAmount) // Reverse the credit
                await tx.partyLedger.create({
                    data: {
                        partyId: sale.customerId,
                        transactionId: sale.id,
                        date: new Date(),
                        description: `Reversal of Sale #${sale.saleNumber}`,
                        type: 'CREDIT',
                        amount: sale.netAmount,
                        runningBalance: party.currentBalance - sale.netAmount
                    }
                })

                if (sale.paidAmount > 0) {
                    await tx.partyLedger.create({
                        data: {
                            partyId: sale.customerId,
                            transactionId: sale.id,
                            date: new Date(),
                            description: `Reversal of Payment for Sale #${sale.saleNumber}`,
                            type: 'DEBIT',
                            amount: sale.paidAmount,
                            runningBalance: party.currentBalance - sale.netAmount + sale.paidAmount
                        }
                    })
                }

                await tx.party.update({
                    where: { id: sale.customerId },
                    data: { currentBalance: party.currentBalance + balanceChange }
                })
            }

            return { success: true }
        })

        revalidatePath('/sales')
        revalidatePath('/products')
        revalidatePath('/parties')
        return result
    } catch (error: any) {
        console.error('Error cancelling sale:', error)
        return { success: false, error: error.message || 'Failed to cancel sale' }
    }
}

export async function updateSalePaymentDB(saleId: string, amount: number) {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Unauthorized' }

        const result = await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                select: {
                    id: true,
                    saleNumber: true,
                    customerId: true,
                    netAmount: true,
                    paidAmount: true
                }
            })

            if (!sale) throw new Error('Sale not found')

            const newPaidAmount = sale.paidAmount + amount
            const newBalanceAmount = sale.netAmount - newPaidAmount

            let paymentStatus: PaymentStatus = 'PARTIAL'
            if (newPaidAmount >= sale.netAmount) paymentStatus = 'PAID'

            // 1. Update Sale record
            await tx.sale.update({
                where: { id: saleId },
                data: {
                    paidAmount: newPaidAmount,
                    balanceAmount: newBalanceAmount,
                    paymentStatus
                }
            })

            // 2. Update Party Balance and Ledger (Customer)
            const party = await tx.party.findUnique({
                where: { id: sale.customerId },
                select: { currentBalance: true }
            })

            if (party) {
                const newPartyBalance = party.currentBalance - amount

                await tx.partyLedger.create({
                    data: {
                        partyId: sale.customerId,
                        transactionId: sale.id,
                        date: new Date(),
                        description: `Payment for Sale #${sale.saleNumber}`,
                        type: 'CREDIT',
                        amount: amount,
                        runningBalance: newPartyBalance
                    }
                })

                await tx.party.update({
                    where: { id: sale.customerId },
                    data: { currentBalance: newPartyBalance }
                })
            }

            return { success: true }
        })

        revalidatePath('/sales')
        revalidatePath(`/sales/${saleId}`)
        revalidatePath('/parties')
        return result
    } catch (error: any) {
        console.error('Error updating sale payment:', error)
        return { success: false, error: error.message || 'Failed to update payment' }
    }
}

export async function getCustomerPurchaseHistoryDB(customerId: string) {
    try {
        const sales = await prisma.sale.findMany({
            where: { customerId, status: 'COMPLETED' },
            include: {
                items: { include: { product: true } },
                invoice: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, sales }
    } catch (error) {
        console.error('Error fetching customer purchase history:', error)
        return { success: false, error: 'Failed to fetch history', sales: [] }
    }
}

export async function getSalesReportDB(filters: {
    startDate: Date
    endDate: Date
    branchId?: string // Link to Warehouse in this context
    categoryId?: string
    userId?: string
}) {
    try {
        const where: any = {
            status: 'COMPLETED',
            createdAt: {
                gte: filters.startDate,
                lte: filters.endDate
            }
        }

        if (filters.branchId) where.warehouseId = filters.branchId
        if (filters.userId) where.userId = filters.userId
        if (filters.categoryId) {
            where.items = {
                some: {
                    product: {
                        categoryId: filters.categoryId
                    }
                }
            }
        }

        const sales = await prisma.sale.findMany({
            where,
            include: {
                items: true
            }
        })

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.netAmount, 0)
        const totalProfit = 0 // Need costPrice in SaleItem or join Product to calculate

        // In a real scenario, we'd join Product to get costPrice
        // For now, let's just return revenue

        return {
            success: true,
            report: {
                totalSales: sales.length,
                totalRevenue,
                totalProfit,
                sales
            }
        }
    } catch (error) {
        console.error('Error fetching sales report:', error)
        return { success: false, error: 'Failed to fetch sales report' }
    }
}

export async function getBestSellingProductsDB(limit: number = 10) {
    try {
        const bestSellers = await prisma.saleItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                totalAmount: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: limit
        })

        const productIds = bestSellers.map(b => b.productId)
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        })

        const result = bestSellers.map(item => ({
            product: products.find(p => p.id === item.productId),
            totalQuantity: item._sum.quantity,
            totalRevenue: item._sum.totalAmount
        }))

        return { success: true, bestSellers: result }
    } catch (error) {
        console.error('Error fetching best sellers:', error)
        return { success: false, error: 'Failed to fetch best sellers', bestSellers: [] }
    }
}
