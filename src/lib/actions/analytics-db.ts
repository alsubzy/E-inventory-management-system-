"use server"

import { prisma } from "@/lib/prisma"

// Dashboard Analytics

export async function getDashboardStatsDB() {
    try {
        const today = new Date()
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)

        // 1. Total Products
        const totalProducts = await prisma.product.count({
            where: { isDeleted: false }
        })

        // 2. Low Stock
        // We need to fetch all products to check low stock (unless we use raw query)
        // Optimization: Filter in DB if possible? 
        // Prisma doesn't support comparing two columns directly in where clause easily without extended clients or raw query.
        // We'll stick to fetching product+ledger sum approach as it's robust for now.
        const products = await prisma.product.findMany({
            where: { isDeleted: false },
            select: { id: true, costPrice: true, reorderLevel: true, name: true, sku: true }
        })

        const hasLedger = (prisma as any).stockLedger !== undefined;

        const stockData = await Promise.all(products.map(async (p) => {
            let qty = 0;
            if (hasLedger) {
                const sum = await prisma.stockLedger.aggregate({
                    where: { productId: p.id },
                    _sum: { quantityChange: true }
                })
                qty = sum._sum.quantityChange || 0;
            }
            return {
                ...p,
                quantity: qty,
                totalValue: qty * p.costPrice,
                isLowStock: qty <= p.reorderLevel
            }
        }))

        const totalStockValue = stockData.reduce((sum, item) => sum + item.totalValue, 0)
        const lowStockItems = stockData.filter(item => item.isLowStock && item.quantity > 0)

        // 3. Financials (Revenue, Expenses, Profit)
        const sales = await prisma.sale.findMany({
            where: { status: { not: 'CANCELLED' } },
            select: { netAmount: true, createdAt: true, items: { include: { product: true } } } // Need product cost for COGS
        })

        const totalRevenue = sales.reduce((sum, s) => sum + s.netAmount, 0)

        // COGS (Approximate based on current cost price)
        const totalCOGS = sales.reduce((sum, sale) => {
            return sum + sale.items.reduce((isum, item) => isum + (item.quantity * (item.product?.costPrice || 0)), 0)
        }, 0)

        const grossProfit = totalRevenue - totalCOGS

        const hasExpenses = (prisma as any).expense !== undefined;
        const expenses = hasExpenses
            ? await prisma.expense.aggregate({ _sum: { amount: true } })
            : { _sum: { amount: 0 } };
        const totalExpenses = (expenses as any)._sum?.amount || 0;
        const netProfit = grossProfit - totalExpenses

        // 4. Chart Data (Last 30 Days)
        // Group sales by day
        const chartMap = new Map<string, { date: string, sales: number, profit: number }>()

        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            chartMap.set(dateStr, { date: dateStr, sales: 0, profit: 0 })
        }

        sales.forEach(sale => {
            const dateStr = sale.createdAt.toISOString().split('T')[0]
            if (chartMap.has(dateStr)) {
                const entry = chartMap.get(dateStr)!
                entry.sales += sale.netAmount
                // Calculate profit for this sale
                const saleCOGS = sale.items.reduce((sum, item) => sum + (item.quantity * (item.product?.costPrice || 0)), 0)
                entry.profit += (sale.netAmount - saleCOGS)
            }
        })

        const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date))

        // 5. Recent Activity
        const recentTransactions = await prisma.stockLedger.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: true, warehouse: true }
        })

        return {
            success: true,
            stats: {
                totalProducts,
                lowStockCount: lowStockItems.length,
                totalStockValue,
                totalRevenue,
                totalExpenses,
                netProfit,
                lowStockItems: lowStockItems.slice(0, 5),
                recentTransactions: recentTransactions.map(t => ({
                    id: t.id,
                    type: t.type,
                    productName: t.product?.name || 'Unknown',
                    quantity: Math.abs(t.quantityChange),
                    warehouseName: t.warehouse?.name || 'Unknown',
                    date: t.createdAt.toISOString(),
                })),
                chartData
            }
        }
    } catch (error: any) {
        console.error('CRITICAL: Dashboard stats failed:', error)
        // Return detailed error for debugging if possible (or just log it)
        return {
            success: false,
            error: error.message || 'Failed to fetch dashboard stats',
            stats: null
        }
    }
}

export async function getInventoryAnalyticsDB() {
    try {
        // Get stock by category
        const categories = await prisma.category.findMany({
            include: {
                products: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        costPrice: true
                    }
                }
            }
        })

        const categoryAnalytics = await Promise.all(
            categories.map(async (category) => {
                const productIds = category.products.map(p => p.id)

                const hasLedger = (prisma as any).stockLedger !== undefined;
                let totalQuantity = 0;
                if (hasLedger) {
                    const stockSum = await prisma.stockLedger.aggregate({
                        where: { productId: { in: productIds } },
                        _sum: { quantityChange: true }
                    })
                    totalQuantity = stockSum._sum.quantityChange || 0
                }
                const totalValue = category.products.reduce((sum, p) => {
                    return sum + (p.costPrice * (totalQuantity / category.products.length))
                }, 0)

                return {
                    categoryName: category.name,
                    productCount: category.products.length,
                    totalQuantity,
                    totalValue
                }
            })
        )

        return { success: true, analytics: categoryAnalytics }
    } catch (error) {
        console.error('Error fetching inventory analytics:', error)
        return { success: false, error: 'Failed to fetch analytics', analytics: [] }
    }
}

export async function getWarehouseAnalyticsDB() {
    try {
        const warehouses = await prisma.warehouse.findMany()

        const warehouseAnalytics = await Promise.all(
            warehouses.map(async (warehouse) => {
                const hasLedger = (prisma as any).stockLedger !== undefined;
                let totalQuantity = 0;
                if (hasLedger) {
                    const stockSum = await prisma.stockLedger.aggregate({
                        where: { warehouseId: warehouse.id },
                        _sum: { quantityChange: true }
                    })
                    totalQuantity = stockSum._sum.quantityChange || 0;
                }

                const productCount = hasLedger ? await prisma.stockLedger.groupBy({
                    by: ['productId'],
                    where: {
                        warehouseId: warehouse.id,
                    }
                }) : [];

                return {
                    warehouseName: warehouse.name,
                    location: warehouse.location,
                    uniqueProducts: productCount.length,
                    totalQuantity
                }
            })
        )

        return { success: true, analytics: warehouseAnalytics }
    } catch (error) {
        console.error('Error fetching warehouse analytics:', error)
        return { success: false, error: 'Failed to fetch analytics', analytics: [] }
    }
}
