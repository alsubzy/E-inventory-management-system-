'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionPlansDB() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return { success: true, apiData: plans };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCurrentSubscriptionDB() {
    try {
        // Assuming single-tenant or settings holds the plan
        const settings = await prisma.settings.findFirst({
            include: { subscriptionPlan: true }
        });
        return { success: true, apiData: settings?.subscriptionPlan || null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSubscriptionDB(planId: string) {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) throw new Error("Settings not found");

        await prisma.settings.update({
            where: { id: settings.id },
            data: { subscriptionPlanId: planId }
        });

        revalidatePath('/subscription');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Admin function to seed/create plans
export async function createSubscriptionPlanDB(data: {
    name: string;
    price: number;
    duration: number;
    features: string;
}) {
    try {
        const plan = await prisma.subscriptionPlan.create({ data });
        revalidatePath('/subscription');
        return { success: true, apiData: plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
