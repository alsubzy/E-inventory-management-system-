"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// Stock Ledger Operations

export async function recordStockChangeDB(data: {
    productId: string
    variantId?: string
    warehouseId: string
    quantityChange: number
    type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER'
    referenceId?: string
    note?: string
}) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const ledgerEntry = await prisma.stockLedger.create({
            data: {
                productId: data.productId,
                variantId: data.variantId || null,
                warehouseId: data.warehouseId,
                quantityChange: data.quantityChange,
                type: data.type,
                referenceId: data.referenceId,
                note: data.note,
                userId,
            },
            include: {
                product: true,
                warehouse: true
            }
        })

        revalidatePath('/products')
        revalidatePath('/warehouses')
        revalidatePath('/transactions')

        return { success: true, ledgerEntry }
    } catch (error) {
        console.error('Error recording stock change:', error)
        return { success: false, error: 'Failed to record stock change' }
    }
}

export async function getStockLedgerDB(filters?: {
    productId?: string
    warehouseId?: string
    type?: string
    startDate?: Date
    endDate?: Date
}) {
    try {
        const where: any = {}

        if (filters?.productId) where.productId = filters.productId
        if (filters?.warehouseId) where.warehouseId = filters.warehouseId
        if (filters?.type) where.type = filters.type
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {}
            if (filters.startDate) where.createdAt.gte = filters.startDate
            if (filters.endDate) where.createdAt.lte = filters.endDate
        }

        const ledger = await prisma.stockLedger.findMany({
            where,
            include: {
                product: { include: { category: true } },
                warehouse: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        return { success: true, ledger }
    } catch (error) {
        console.error('Error fetching stock ledger:', error)
        return { success: false, error: 'Failed to fetch stock ledger', ledger: [] }
    }
}

export async function getProductStockByWarehouseDB(productId: string) {
    try {
        const stockByWarehouse = await prisma.stockLedger.groupBy({
            by: ['warehouseId'],
            where: { productId },
            _sum: {
                quantityChange: true
            }
        })

        const warehouseIds = stockByWarehouse.map(s => s.warehouseId)
        const warehouses = await prisma.warehouse.findMany({
            where: { id: { in: warehouseIds } }
        })

        const stock = stockByWarehouse.map(s => {
            const warehouse = warehouses.find(w => w.id === s.warehouseId)
            return {
                warehouseId: s.warehouseId,
                warehouseName: warehouse?.name || 'Unknown',
                quantity: s._sum.quantityChange || 0
            }
        })

        return { success: true, stock }
    } catch (error) {
        console.error('Error fetching product stock:', error)
        return { success: false, error: 'Failed to fetch product stock', stock: [] }
    }
}

export async function getWarehouseInventoryDB(warehouseId: string) {
    try {
        const stockByProduct = await prisma.stockLedger.groupBy({
            by: ['productId'],
            where: { warehouseId },
            _sum: {
                quantityChange: true
            }
        })

        const productIds = stockByProduct.map(s => s.productId)
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                isDeleted: false
            },
            include: { category: true }
        })

        const inventory = stockByProduct
            .map(stock => {
                const product = products.find(p => p.id === stock.productId)
                const quantity = stock._sum.quantityChange || 0

                if (!product || quantity <= 0) return null

                return {
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    category: product.category?.name,
                    quantity,
                    costPrice: product.costPrice,
                    sellingPrice: product.sellingPrice,
                    totalValue: quantity * product.costPrice,
                    reorderLevel: product.reorderLevel,
                    isLowStock: quantity <= product.reorderLevel
                }
            })
            .filter(Boolean)

        return { success: true, inventory }
    } catch (error) {
        console.error('Error fetching warehouse inventory:', error)
        return { success: false, error: 'Failed to fetch warehouse inventory', inventory: [] }
    }
}

export async function getCurrentStockDB(productId: string, warehouseId: string) {
    try {
        const result = await prisma.stockLedger.aggregate({
            where: {
                productId,
                warehouseId
            },
            _sum: {
                quantityChange: true
            }
        })

        const quantity = result._sum.quantityChange || 0

        return { success: true, quantity }
    } catch (error) {
        console.error('Error fetching current stock:', error)
        return { success: false, error: 'Failed to fetch current stock', quantity: 0 }
    }
}

// Helper function to check if product is low stock across all warehouses
export async function checkLowStockDB(productId: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { reorderLevel: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        const totalStock = await prisma.stockLedger.aggregate({
            where: { productId },
            _sum: {
                quantityChange: true
            }
        })

        const quantity = totalStock._sum.quantityChange || 0
        const isLowStock = quantity <= product.reorderLevel

        return { success: true, quantity, isLowStock }
    } catch (error) {
        console.error('Error checking low stock:', error)
        return { success: false, error: 'Failed to check stock level' }
    }
}
