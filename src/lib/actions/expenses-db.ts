'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Expense Categories

export async function getExpenseCategoriesDB() {
    try {
        const categories = await prisma.expenseCategory.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { expenses: true } } }
        });
        return { success: true, apiData: categories };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createExpenseCategoryDB(data: { name: string; description?: string }) {
    try {
        const category = await prisma.expenseCategory.create({
            data: {
                name: data.name,
                description: data.description,
            }
        });
        revalidatePath('/expenses');
        return { success: true, apiData: category };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Expenses

export async function getExpensesDB() {
    try {
        const expenses = await prisma.expense.findMany({
            include: { category: true },
            orderBy: { date: 'desc' }
        });
        return { success: true, apiData: expenses };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createExpenseDB(data: {
    categoryId: string;
    amount: number;
    date: Date;
    description?: string;
    reference?: string;
    paymentMethod?: string;
    accountId?: string;
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Expense
            const expense = await tx.expense.create({
                data: {
                    categoryId: data.categoryId,
                    amount: data.amount,
                    date: data.date,
                    description: data.description,
                    reference: data.reference,
                    paymentMethod: data.paymentMethod,
                    accountId: data.accountId,
                    // paidBy: userId (TODO: get from session)
                }
            });

            // 2. Update Account Balance (if selected)
            if (data.accountId) {
                await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: data.amount } }
                });
            }

            return expense;
        });

        revalidatePath('/expenses');
        revalidatePath('/accounts');
        return { success: true, apiData: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
