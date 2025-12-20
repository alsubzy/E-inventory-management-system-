'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSettingsDB() {
    try {
        const settings = await prisma.settings.findFirst();
        return { success: true, apiData: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSettingsDB(data: {
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    currency?: string;
    taxRate?: number;
}) {
    try {
        // Upsert logic: update if exists, create if not
        // Since we don't know the ID, findFirst is the way, or ensure only one row exists.
        // For upsert, we need a unique constraint or ID.
        // Here we will try to find the first one.

        const existing = await prisma.settings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.settings.update({
                where: { id: existing.id },
                data,
            });
        } else {
            settings = await prisma.settings.create({
                data,
            });
        }

        revalidatePath('/settings');
        return { success: true, apiData: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
