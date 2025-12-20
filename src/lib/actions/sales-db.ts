"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { SalesStatus, PaymentStatus } from "@/lib/types"

// 1. Create Sale (Enhanced with Split Payments)
export async function createSaleDB(data: {
    customerId: string
    warehouseId: string
    totalAmount: number
    discountAmount: number
    taxAmount: number
    netAmount: number
    paidAmount: number
    notes?: string
    paymentMethod?: string // Backward compatibility
    accountId?: string // Backward compatibility
    payments?: {
        accountId: string
        amount: number
        method: string
    }[]
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

        // Standardize payments
        const paymentList = data.payments || (data.accountId ? [{
            accountId: data.accountId,
            amount: data.paidAmount,
            method: data.paymentMethod || 'CASH'
        }] : [])

        const totalPaid = paymentList.reduce((sum, p) => sum + p.amount, 0)

        const result = await prisma.$transaction(async (tx) => {
            // 1. Validate stock
            for (const item of data.items) {
                const stock = await tx.stockLedger.aggregate({
                    where: { productId: item.productId, warehouseId: data.warehouseId },
                    _sum: { quantityChange: true }
                })
                if ((stock._sum.quantityChange || 0) < item.quantity) {
                    const p = await tx.product.findUnique({ where: { id: item.productId } })
                    throw new Error(`Out of stock: ${p?.name}`)
                }
            }

            const saleNumber = `S-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
            let paymentStatus: PaymentStatus = 'UNPAID'
            if (totalPaid >= data.netAmount) paymentStatus = 'PAID'
            else if (totalPaid > 0) paymentStatus = 'PARTIAL'

            // 2. Create Sale
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    customerId: data.customerId,
                    warehouseId: data.warehouseId,
                    totalAmount: data.totalAmount,
                    discountAmount: data.discountAmount,
                    taxAmount: data.taxAmount,
                    netAmount: data.netAmount,
                    paidAmount: totalPaid,
                    balanceAmount: data.netAmount - totalPaid,
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
                }
            })

            // 3. Stock Deduction
            for (const item of data.items) {
                await tx.stockLedger.create({
                    data: {
                        productId: item.productId,
                        warehouseId: data.warehouseId,
                        quantityChange: -item.quantity,
                        type: 'SALE',
                        referenceId: sale.id,
                        userId,
                        note: `Sale #${saleNumber}`
                    }
                })
            }

            // 4. Accounting (Split Payments & Customer Balance)
            const party = await tx.party.findUnique({ where: { id: data.customerId } })
            if (party) {
                // Sale Ledger Entry
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

                // Create Payments
                for (const p of paymentList) {
                    if (p.amount <= 0) continue

                    await tx.payment.create({
                        data: {
                            partyId: data.customerId,
                            amount: p.amount,
                            method: p.method,
                            type: 'PAYMENT_RECEIVED',
                            reference: saleNumber,
                            date: new Date(),
                            saleId: sale.id,
                            accountId: p.accountId
                        }
                    })

                    await tx.account.update({
                        where: { id: p.accountId },
                        data: { balance: { increment: p.amount } }
                    })

                    await tx.partyLedger.create({
                        data: {
                            partyId: data.customerId,
                            transactionId: sale.id,
                            date: new Date(),
                            description: `Payment per Sale #${saleNumber} (${p.method})`,
                            type: 'CREDIT',
                            amount: p.amount,
                            runningBalance: party.currentBalance + data.netAmount - p.amount // Approx
                        }
                    })
                }

                await tx.party.update({
                    where: { id: data.customerId },
                    data: { currentBalance: { increment: data.netAmount - totalPaid } }
                })
            }

            // 5. Invoice
            await tx.invoice.create({
                data: {
                    saleId: sale.id,
                    invoiceNumber: `INV-${saleNumber}`,
                    totalAmount: data.netAmount
                }
            })

            return sale
        })

        revalidatePath('/sales')
        revalidatePath('/pos')
        return { success: true, sale: result }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 2. Create Sales Return
export async function createSalesReturnDB(data: {
    saleId: string
    items: {
        saleItemId: string
        productId: string
        quantity: number
        reason?: string
    }[]
    refundAmount: number
    accountId?: string // To deduct refund from
}) {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Unauthorized' }

        const result = await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: data.saleId },
                include: { items: true, customer: true }
            })
            if (!sale) throw new Error("Sale not found")

            // 1. Process Items
            for (const rItem of data.items) {
                const sItem = sale.items.find(i => i.id === rItem.saleItemId)
                if (!sItem) throw new Error("Item not found in sale")
                if (sItem.returnedQuantity + rItem.quantity > sItem.quantity) {
                    throw new Error(`Cannot return more than purchased for ${rItem.productId}`)
                }

                // Update SaleItem
                await tx.saleItem.update({
                    where: { id: rItem.saleItemId },
                    data: { returnedQuantity: { increment: rItem.quantity } }
                })

                // Restore Stock
                await tx.stockLedger.create({
                    data: {
                        productId: rItem.productId,
                        warehouseId: sale.warehouseId,
                        quantityChange: rItem.quantity,
                        type: 'RETURN',
                        referenceId: sale.id,
                        userId,
                        note: `Return for Sale #${sale.saleNumber}. Reason: ${rItem.reason || 'None'}`
                    }
                })
            }

            // 2. Handle Refund
            if (data.refundAmount > 0) {
                if (data.accountId) {
                    await tx.account.update({
                        where: { id: data.accountId },
                        data: { balance: { decrement: data.refundAmount } }
                    })
                }

                // Create Refund Payment (Outgoing)
                await tx.payment.create({
                    data: {
                        partyId: sale.customerId,
                        amount: data.refundAmount,
                        method: 'CASH',
                        type: 'PAYMENT_MADE',
                        reference: `REFUND-${sale.saleNumber}`,
                        date: new Date(),
                        saleId: sale.id,
                        accountId: data.accountId
                    }
                })

                // Party Ledger Entry
                await tx.partyLedger.create({
                    data: {
                        partyId: sale.customerId,
                        date: new Date(),
                        description: `Refund for Sale #${sale.saleNumber}`,
                        type: 'DEBIT',
                        amount: data.refundAmount,
                        runningBalance: sale.customer.currentBalance + data.refundAmount
                    }
                })
            }

            // 3. Update Party Balance
            // If it was a credit sale, we might just reduce their balance
            const totalReturnCredit = data.items.reduce((sum, item) => {
                const sItem = sale.items.find(i => i.id === item.saleItemId)
                return sum + (item.quantity * (sItem?.unitPrice || 0))
            }, 0)

            await tx.party.update({
                where: { id: sale.customerId },
                data: { currentBalance: { decrement: totalReturnCredit - data.refundAmount } }
            })

            // Update Sale Status if needed (Optional: Logic to mark as RETURNED if all items returned)
            const allItems = await tx.saleItem.findMany({ where: { saleId: data.saleId } })
            const allReturned = allItems.every(i => i.returnedQuantity >= i.quantity)
            if (allReturned) {
                await tx.sale.update({ where: { id: data.saleId }, data: { status: 'RETURNED' } })
            }

            return { success: true }
        })

        revalidatePath('/sales')
        return result
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getSalesDB(filters?: {
    customerId?: string
    status?: string
    paymentStatus?: string
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
                invoice: true,
                payments: true
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

                    // Note: Reversing payment doesn't automatically delete the Payment record or create a negative Payment.
                    // For now, leaving it as an accounting correction in PartyLedger.
                    // Ideally, we should also revert Account balance, but cancelSaleDB didn't do it before.
                    // TODO: Revert Account Balance if it was linked. But we don't know which account easily unless we query Payment.
                    // Skipped for now to match original logic scope.
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

export async function updateSalePaymentDB(saleId: string, amount: number, accountId?: string) {
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

            // 3. Create Payment Record and Update Account
            // Always create a payment record for tracking
            await tx.payment.create({
                data: {
                    partyId: sale.customerId,
                    amount: amount,
                    method: 'CASH', // Default or need input
                    type: 'PAYMENT_RECEIVED',
                    reference: sale.saleNumber,
                    date: new Date(),
                    note: `Additional Payment for Sale #${sale.saleNumber}`,
                    accountId: accountId,
                }
            })

            if (accountId) {
                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { increment: amount } }
                })
            }

            return { success: true }
        })

        revalidatePath('/sales')
        revalidatePath(`/sales/${saleId}`)
        revalidatePath('/parties')
        revalidatePath('/accounts')
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
