'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type AccountInput = {
    name: string;
    type: string; // CASH, BANK, MOBILE_MONEY
    accountNumber?: string;
    description?: string;
    currency?: string;
    isDefault?: boolean;
    balance?: number; // Initial balance
};

export async function createAccountDB(data: AccountInput) {
    try {
        const account = await prisma.account.create({
            data: {
                name: data.name,
                type: data.type,
                accountNumber: data.accountNumber,
                description: data.description,
                currency: data.currency || 'USD',
                isDefault: data.isDefault || false,
                balance: data.balance || 0,
            }
        });
        revalidatePath('/accounts');
        return { success: true, apiData: account };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAccountDB(id: string, data: Partial<AccountInput>) {
    try {
        const account = await prisma.account.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                accountNumber: data.accountNumber,
                description: data.description,
                isDefault: data.isDefault,
                // Balance is usually updated via transactions
            }
        });
        revalidatePath('/accounts');
        return { success: true, apiData: account };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAccountDB(id: string) {
    try {
        await prisma.account.delete({ where: { id } });
        revalidatePath('/accounts');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAccountsDB() {
    try {
        const accounts = await prisma.account.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, apiData: accounts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAccountByIdDB(id: string) {
    try {
        const account = await prisma.account.findUnique({
            where: { id },
            include: {
                expenses: { take: 10, orderBy: { date: 'desc' } }, // Recent activity
                payments: { take: 10, orderBy: { date: 'desc' } }
            }
        });
        return { success: true, apiData: account };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Transactional operations (generic)
export async function adjustAccountBalanceDB(id: string, amount: number, type: 'CREDIT' | 'DEBIT') {
    try {
        const adjustment = type === 'CREDIT' ? amount : -amount;
        const account = await prisma.account.update({
            where: { id },
            data: {
                balance: { increment: adjustment }
            }
        });
        revalidatePath(`/accounts/${id}`);
        revalidatePath('/accounts');
        return { success: true, apiData: account };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAccountHistoryDB(accountId: string) {
    try {
        const [payments, expenses] = await Promise.all([
            prisma.payment.findMany({
                where: { accountId },
                orderBy: { date: 'desc' },
                include: { party: true }
            }),
            prisma.expense.findMany({
                where: { accountId },
                orderBy: { date: 'desc' },
                include: { category: true }
            })
        ]);

        // Normalize data for the UI
        const history = [
            ...payments.map(p => ({
                id: p.id,
                date: p.date,
                type: p.type === 'PAYMENT_RECEIVED' ? 'IN' : 'OUT',
                amount: p.amount,
                description: p.note || `Payment ${p.type === 'PAYMENT_RECEIVED' ? 'from' : 'to'} ${p.party?.name}`,
                category: 'Payment',
                reference: p.reference,
                source: 'PAYMENT'
            })),
            ...expenses.map(e => ({
                id: e.id,
                date: e.date,
                type: 'OUT',
                amount: e.amount,
                description: e.description || 'Expense',
                category: e.category.name,
                reference: e.reference,
                source: 'EXPENSE'
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { success: true, history };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
