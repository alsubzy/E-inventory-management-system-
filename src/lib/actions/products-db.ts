"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { hasRole } from "@/lib/auth-server"

// Product CRUD Operations

export async function createProductDB(data: {
    name: string
    description?: string
    sku: string
    barcode?: string
    unit: string
    costPrice: number
    sellingPrice: number
    taxRate?: number
    reorderLevel?: number
    status?: string
    categoryId?: string
    supplierId?: string
}) {
    try {
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return { success: false, error: 'Access Denied: You do not have permission to create products' }
        }
        const { userId } = await auth()

        // Check if SKU already exists
        const existing = await prisma.product.findUnique({
            where: { sku: data.sku }
        })

        if (existing) {
            return { success: false, error: 'Product with this SKU already exists' }
        }

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                sku: data.sku,
                barcode: data.barcode,
                unit: data.unit,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                taxRate: data.taxRate || 0,
                reorderLevel: data.reorderLevel || 0,
                status: data.status || 'ACTIVE',
                categoryId: data.categoryId || null,
                supplierId: data.supplierId || null,
            },
            include: {
                category: true,
                variants: true
            }
        })

        revalidatePath('/products')
        return { success: true, product }
    } catch (error) {
        console.error('Error creating product:', error)
        return { success: false, error: 'Failed to create product' }
    }
}

export async function getProductsDB() {
    try {
        const products = await prisma.product.findMany({
            where: { isDeleted: false },
            include: {
                category: true,
                variants: {
                    where: { isDeleted: false }
                },
                _count: {
                    select: { ledgerEntries: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, products }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { success: false, error: 'Failed to fetch products', products: [] }
    }
}

export async function getProductsWithStockDB(warehouseId?: string) {
    try {
        const where: any = { isDeleted: false }

        const ledgerWhere: any = {}
        if (warehouseId) {
            ledgerWhere.warehouseId = warehouseId
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                ledgerEntries: {
                    where: ledgerWhere,
                    select: {
                        quantityChange: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        const productsWithStock = products.map(p => {
            const totalStock = p.ledgerEntries.reduce((sum, entry) => sum + entry.quantityChange, 0)
            return {
                ...p,
                totalStock,
                ledgerEntries: undefined
            }
        })

        return { success: true, products: productsWithStock }
    } catch (error) {
        console.error('Error fetching products with stock:', error)
        return { success: false, error: 'Failed to fetch products with stock', products: [] }
    }
}

export async function getProductDB(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: {
                    where: { isDeleted: false }
                },
                ledgerEntries: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { warehouse: true }
                }
            }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        return { success: true, product }
    } catch (error) {
        console.error('Error fetching product:', error)
        return { success: false, error: 'Failed to fetch product' }
    }
}

export async function updateProductDB(id: string, data: Partial<{
    name: string
    description: string
    sku: string
    barcode: string
    unit: string
    costPrice: number
    sellingPrice: number
    taxRate: number
    reorderLevel: number
    status: string
    categoryId: string
    supplierId: string
}>) {
    try {
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return { success: false, error: 'Access Denied: You do not have permission to manage prices or update products' }
        }
        // If updating SKU, check if new SKU already exists
        if (data.sku) {
            const existing = await prisma.product.findFirst({
                where: {
                    sku: data.sku,
                    id: { not: id }
                }
            })

            if (existing) {
                return { success: false, error: 'Product with this SKU already exists' }
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...data,
                categoryId: data.categoryId === '' ? null : data.categoryId,
                supplierId: data.supplierId === '' ? null : data.supplierId,
            },
            include: {
                category: true,
                variants: true
            }
        })

        revalidatePath('/products')
        revalidatePath(`/products/${id}`)
        return { success: true, product }
    } catch (error) {
        console.error('Error updating product:', error)
        return { success: false, error: 'Failed to update product' }
    }
}

export async function deleteProductDB(id: string) {
    try {
        if (!(await hasRole(['ADMIN']))) {
            return { success: false, error: 'Access Denied: Only Admins can delete products' }
        }
        // Soft delete
        const product = await prisma.product.update({
            where: { id },
            data: { isDeleted: true }
        })

        revalidatePath('/products')
        return { success: true, product }
    } catch (error) {
        console.error('Error deleting product:', error)
        return { success: false, error: 'Failed to delete product' }
    }
}

export async function getProductStockDB(productId: string) {
    try {
        // Get stock by warehouse
        const stockByWarehouse = await prisma.stockLedger.groupBy({
            by: ['warehouseId'],
            where: { productId },
            _sum: {
                quantityChange: true
            }
        })

        // Get warehouse details
        const warehouseIds = stockByWarehouse.map(s => s.warehouseId)
        const warehouses = await prisma.warehouse.findMany({
            where: { id: { in: warehouseIds } }
        })

        const stockData = stockByWarehouse.map(stock => {
            const warehouse = warehouses.find(w => w.id === stock.warehouseId)
            return {
                warehouseId: stock.warehouseId,
                warehouseName: warehouse?.name || 'Unknown',
                quantity: stock._sum.quantityChange || 0
            }
        })

        return { success: true, stock: stockData }
    } catch (error) {
        console.error('Error fetching product stock:', error)
        return { success: false, error: 'Failed to fetch stock', stock: [] }
    }
}
