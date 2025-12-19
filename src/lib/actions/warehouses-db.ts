"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// Warehouse CRUD Operations

export async function createWarehouseDB(data: {
    name: string
    location?: string
}) {
    try {
        const warehouse = await prisma.warehouse.create({
            data: {
                name: data.name,
                location: data.location,
            }
        })

        revalidatePath('/warehouses')
        return { success: true, warehouse }
    } catch (error) {
        console.error('Error creating warehouse:', error)
        return { success: false, error: 'Failed to create warehouse' }
    }
}

export async function getWarehousesDB() {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                _count: {
                    select: { ledgerEntries: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        // Get stock counts for each warehouse
        const warehousesWithStock = await Promise.all(
            warehouses.map(async (warehouse) => {
                const stockSummary = await prisma.stockLedger.groupBy({
                    by: ['productId'],
                    where: { warehouseId: warehouse.id },
                    _sum: {
                        quantityChange: true
                    }
                })

                const totalProducts = stockSummary.filter(s => (s._sum.quantityChange || 0) > 0).length
                const totalQuantity = stockSummary.reduce((sum, s) => sum + (s._sum.quantityChange || 0), 0)

                return {
                    ...warehouse,
                    totalProducts,
                    totalQuantity
                }
            })
        )

        return { success: true, warehouses: warehousesWithStock }
    } catch (error) {
        console.error('Error fetching warehouses:', error)
        return { success: false, error: 'Failed to fetch warehouses', warehouses: [] }
    }
}

export async function getWarehouseDB(id: string) {
    try {
        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
            include: {
                ledgerEntries: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!warehouse) {
            return { success: false, error: 'Warehouse not found' }
        }

        return { success: true, warehouse }
    } catch (error) {
        console.error('Error fetching warehouse:', error)
        return { success: false, error: 'Failed to fetch warehouse' }
    }
}

export async function getWarehouseStockDB(warehouseId: string) {
    try {
        const stockByProduct = await prisma.stockLedger.groupBy({
            by: ['productId'],
            where: { warehouseId },
            _sum: {
                quantityChange: true
            }
        })

        // Get product details
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
                    product,
                    quantity,
                    value: quantity * product.costPrice,
                    isLowStock: quantity <= product.reorderLevel
                }
            })
            .filter(Boolean)

        return { success: true, inventory }
    } catch (error) {
        console.error('Error fetching warehouse stock:', error)
        return { success: false, error: 'Failed to fetch warehouse stock', inventory: [] }
    }
}

export async function updateWarehouseDB(id: string, data: {
    name?: string
    location?: string
}) {
    try {
        const warehouse = await prisma.warehouse.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location,
            }
        })

        revalidatePath('/warehouses')
        revalidatePath(`/warehouses/${id}`)
        return { success: true, warehouse }
    } catch (error) {
        console.error('Error updating warehouse:', error)
        return { success: false, error: 'Failed to update warehouse' }
    }
}

export async function deleteWarehouseDB(id: string) {
    try {
        // Check if warehouse has stock
        const stockCount = await prisma.stockLedger.count({
            where: { warehouseId: id }
        })

        if (stockCount > 0) {
            return {
                success: false,
                error: 'Cannot delete warehouse with existing stock. Please transfer stock first.'
            }
        }

        await prisma.warehouse.delete({
            where: { id }
        })

        revalidatePath('/warehouses')
        return { success: true }
    } catch (error) {
        console.error('Error deleting warehouse:', error)
        return { success: false, error: 'Failed to delete warehouse' }
    }
}
