"use server"

import { prisma } from "@/lib/prisma"
import { hasRole } from "@/lib/auth-server"

// 1. Profit & Loss Report
export async function getProfitLossReportDB(startDate: Date, endDate: Date) {
    try {
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return { success: false, error: 'Access Denied: Insufficient permissions to view Profit & Loss reports' }
        }
        const sales = await prisma.sale.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startDate, lte: endDate }
            },
            include: {
                items: true
            }
        })

        const totalRevenue = sales.reduce((sum, s) => sum + s.netAmount, 0)
        const totalTax = sales.reduce((sum, s) => sum + s.taxAmount, 0)
        const totalDiscount = sales.reduce((sum, s) => sum + s.discountAmount, 0)

        // COGS = Sum of costPrice * quantity for all items in completed sales
        const totalCOGS = sales.reduce((sum, sale) => {
            return sum + sale.items.reduce((isum, item) => isum + (item.quantity * item.costPrice), 0)
        }, 0)

        const grossProfit = totalRevenue - totalCOGS

        // Optional: Fetch expenses if available
        const expenses = await prisma.expense.aggregate({
            where: { date: { gte: startDate, lte: endDate } },
            _sum: { amount: true }
        })
        const totalExpenses = expenses._sum.amount || 0
        const netProfit = grossProfit - totalExpenses

        return {
            success: true,
            report: {
                totalRevenue,
                totalCOGS,
                grossProfit,
                totalExpenses,
                netProfit,
                totalTax,
                totalDiscount,
                salesCount: sales.length
            }
        }
    } catch (error: any) {
        console.error('Error fetching P&L report:', error)
        return { success: false, error: error.message }
    }
}

// 2. Stock Valuation Report
export async function getStockValuationDB() {
    try {
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return { success: false, error: 'Access Denied: Insufficient permissions to view stock valuation' }
        }
        const products = await prisma.product.findMany({
            where: { isDeleted: false },
            include: {
                ledgerEntries: {
                    select: { quantityChange: true }
                }
            }
        })

        const valuationByProduct = products.map(p => {
            const stock = p.ledgerEntries.reduce((sum, l) => sum + l.quantityChange, 0)
            return {
                id: p.id,
                name: p.name,
                sku: p.sku,
                stock,
                costPrice: p.costPrice,
                sellingPrice: p.sellingPrice,
                valuation: stock * p.costPrice,
                potentialRevenue: stock * p.sellingPrice
            }
        })

        const totalValuation = valuationByProduct.reduce((sum, p) => sum + p.valuation, 0)
        const totalPotentialRevenue = valuationByProduct.reduce((sum, p) => sum + p.potentialRevenue, 0)

        return {
            success: true,
            totalValuation,
            totalPotentialRevenue,
            valuationByProduct
        }
    } catch (error: any) {
        console.error('Error fetching stock valuation:', error)
        return { success: false, error: error.message }
    }
}

// 3. Outstanding Payments Report
export async function getOutstandingPaymentsReportDB() {
    try {
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return { success: false, error: 'Access Denied: Insufficient permissions to view outstanding payments' }
        }
        const customers = await prisma.party.findMany({
            where: {
                type: { in: ['CUSTOMER', 'BOTH'] },
                currentBalance: { gt: 0 }
            },
            orderBy: { currentBalance: 'desc' }
        })

        return { success: true, customers }
    } catch (error: any) {
        console.error('Error fetching outstanding payments:', error)
        return { success: false, error: error.message }
    }
}
