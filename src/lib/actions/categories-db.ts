"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// Category CRUD Operations

export async function createCategoryDB(data: {
    name: string
    description?: string
    parentId?: string
}) {
    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId || null,
            },
        })

        revalidatePath('/products')
        return { success: true, category }
    } catch (error) {
        console.error('Error creating category:', error)
        return { success: false, error: 'Failed to create category' }
    }
}

export async function getCategoriesDB() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false, error: 'Failed to fetch categories', categories: [] }
    }
}

export async function getCategoryDB(id: string) {
    try {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                products: {
                    where: { isDeleted: false },
                    take: 10
                }
            }
        })

        return { success: true, category }
    } catch (error) {
        console.error('Error fetching category:', error)
        return { success: false, error: 'Failed to fetch category' }
    }
}

export async function updateCategoryDB(id: string, data: {
    name?: string
    description?: string
    parentId?: string
}) {
    try {
        const category = await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId,
            }
        })

        revalidatePath('/products')
        return { success: true, category }
    } catch (error) {
        console.error('Error updating category:', error)
        return { success: false, error: 'Failed to update category' }
    }
}

export async function deleteCategoryDB(id: string) {
    try {
        // Check if category has products
        const category = await prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } }
        })

        if (category && category._count.products > 0) {
            return {
                success: false,
                error: 'Cannot delete category with existing products. Please reassign or delete products first.'
            }
        }

        await prisma.category.delete({
            where: { id }
        })

        revalidatePath('/products')
        return { success: true }
    } catch (error) {
        console.error('Error deleting category:', error)
        return { success: false, error: 'Failed to delete category' }
    }
}
