"use server"

import { prisma } from "@/lib/prisma"

// Dashboard Analytics

export async function getDashboardStatsDB() {
    try {
        // Get total products count
        const totalProducts = await prisma.product.count({
            where: { isDeleted: false }
        })

        // Calculate total stock value
        const products = await prisma.product.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                costPrice: true,
                reorderLevel: true,
                name: true,
                sku: true
            }
        })

        // Get stock quantities for each product
        const stockData = await Promise.all(
            products.map(async (product) => {
                const stockSum = await prisma.stockLedger.aggregate({
                    where: { productId: product.id },
                    _sum: { quantityChange: true }
                })

                const quantity = stockSum._sum.quantityChange || 0

                return {
                    ...product,
                    quantity,
                    totalValue: quantity * product.costPrice,
                    isLowStock: quantity <= product.reorderLevel
                }
            })
        )

        const totalStockValue = stockData.reduce((sum, item) => sum + item.totalValue, 0)
        const lowStockItems = stockData.filter(item => item.isLowStock && item.quantity > 0)
        const lowStockCount = lowStockItems.length

        // Get recent stock movements (as transactions)
        const recentTransactions = await prisma.stockLedger.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                warehouse: true
            }
        })

        // Calculate revenue (sum of all sales)
        const salesRevenue = await prisma.stockLedger.aggregate({
            where: { type: 'SALE' },
            _sum: { quantityChange: true }
        })

        // Approximate revenue calculation (this should be improved with actual price data)
        const totalRevenue = Math.abs(salesRevenue._sum.quantityChange || 0) * 50 // Placeholder calculation

        return {
            success: true,
            stats: {
                totalProducts,
                lowStockCount,
                totalStockValue,
                totalRevenue,
                lowStockItems: lowStockItems.slice(0, 5),
                recentTransactions: recentTransactions.map(t => ({
                    id: t.id,
                    type: t.type,
                    productName: t.product.name,
                    quantity: Math.abs(t.quantityChange),
                    warehouseName: t.warehouse.name,
                    date: t.createdAt.toISOString(),
                    reference: t.referenceId || ''
                }))
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
            success: false,
            error: 'Failed to fetch dashboard statistics',
            stats: {
                totalProducts: 0,
                lowStockCount: 0,
                totalStockValue: 0,
                totalRevenue: 0,
                lowStockItems: [],
                recentTransactions: []
            }
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

                const stockSum = await prisma.stockLedger.aggregate({
                    where: { productId: { in: productIds } },
                    _sum: { quantityChange: true }
                })

                const totalQuantity = stockSum._sum.quantityChange || 0
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
                const stockSum = await prisma.stockLedger.aggregate({
                    where: { warehouseId: warehouse.id },
                    _sum: { quantityChange: true }
                })

                const productCount = await prisma.stockLedger.groupBy({
                    by: ['productId'],
                    where: {
                        warehouseId: warehouse.id,
                    }
                })

                return {
                    warehouseName: warehouse.name,
                    location: warehouse.location,
                    uniqueProducts: productCount.length,
                    totalQuantity: stockSum._sum.quantityChange || 0
                }
            })
        )

        return { success: true, analytics: warehouseAnalytics }
    } catch (error) {
        console.error('Error fetching warehouse analytics:', error)
        return { success: false, error: 'Failed to fetch analytics', analytics: [] }
    }
}
