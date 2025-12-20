'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hasRole } from '@/lib/auth-server';
import { auth } from '@clerk/nextjs/server';
import { createAuditLogDB } from './audit-db';

// Get Business Information (Public, Cached)
export async function getBusinessInfoDB() {
    try {
        const settings = await prisma.settings.findFirst();

        // If no settings exist, create default ones
        if (!settings) {
            const defaultSettings = await prisma.settings.create({
                data: {
                    businessName: 'E-Inventory LTD',
                    currency: 'USD',
                    taxRate: 0,
                }
            });
            return { success: true, data: defaultSettings };
        }

        return { success: true, data: settings };
    } catch (error: any) {
        console.error('Error fetching business info:', error);
        return { success: false, error: error.message, data: null };
    }
}

// Update Business Information (Admin Only, with Audit Logging)
export async function updateBusinessInfoDB(data: {
    businessName: string;
    legalName?: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    currency?: string;
    taxRate?: number;
    taxId?: string;
    invoiceFooter?: string;
    socialLinks?: string; // JSON string
}) {
    try {
        // RBAC Check: Allow Admin, Manager, and Staff to update business info
        if (!(await hasRole(['ADMIN', 'MANAGER', 'STAFF']))) {
            return {
                success: false,
                error: 'Access Denied: You do not have permission to update business information'
            };
        }

        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: 'Unauthorized: No user session found' };
        }

        // Validate required fields
        if (!data.businessName || data.businessName.trim().length < 2) {
            return {
                success: false,
                error: 'Business name is required and must be at least 2 characters'
            };
        }

        // Validate email if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return { success: false, error: 'Invalid email address format' };
            }
        }

        // Validate website URL if provided
        if (data.website && data.website.trim().length > 0) {
            try {
                new URL(data.website);
            } catch {
                return { success: false, error: 'Invalid website URL format' };
            }
        }

        // Validate social links JSON if provided
        if (data.socialLinks) {
            try {
                JSON.parse(data.socialLinks);
            } catch {
                return { success: false, error: 'Invalid social links format' };
            }
        }

        // Validate tax rate
        if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
            return { success: false, error: 'Tax rate must be between 0 and 100' };
        }

        // Get existing settings for comparison (for audit log)
        const existing = await prisma.settings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.settings.update({
                where: { id: existing.id },
                data: {
                    businessName: data.businessName.trim(),
                    legalName: data.legalName?.trim() || null,
                    logo: data.logo?.trim() || null,
                    address: data.address?.trim() || null,
                    phone: data.phone?.trim() || null,
                    email: data.email?.trim() || null,
                    website: data.website?.trim() || null,
                    currency: data.currency || 'USD',
                    taxRate: data.taxRate ?? 0,
                    taxId: data.taxId?.trim() || null,
                    invoiceFooter: data.invoiceFooter || null,
                    socialLinks: data.socialLinks || null,
                },
            });

            // Create audit log entry
            await createAuditLogDB({
                action: 'UPDATE_BUSINESS_INFO',
                entityType: 'Settings',
                entityId: settings.id,
                details: `Updated business information: ${data.businessName}`,
            });
        } else {
            settings = await prisma.settings.create({
                data: {
                    businessName: data.businessName.trim(),
                    legalName: data.legalName?.trim() || null,
                    logo: data.logo?.trim() || null,
                    address: data.address?.trim() || null,
                    phone: data.phone?.trim() || null,
                    email: data.email?.trim() || null,
                    website: data.website?.trim() || null,
                    currency: data.currency || 'USD',
                    taxRate: data.taxRate ?? 0,
                    taxId: data.taxId?.trim() || null,
                    invoiceFooter: data.invoiceFooter || null,
                    socialLinks: data.socialLinks || null,
                },
            });

            // Create audit log entry
            await createAuditLogDB({
                action: 'CREATE_BUSINESS_INFO',
                entityType: 'Settings',
                entityId: settings.id,
                details: `Created business information: ${data.businessName}`,
            });
        }

        // Revalidate all pages that might display business info
        revalidatePath('/settings');
        revalidatePath('/');
        revalidatePath('/pos');
        revalidatePath('/sales');

        return { success: true, data: settings };
    } catch (error: any) {
        console.error('Error updating business info:', error);
        return { success: false, error: error.message };
    }
}

// Get Settings (Legacy function for backward compatibility)
export async function getSettingsDB() {
    return getBusinessInfoDB();
}

// Update Settings (Legacy function for backward compatibility)
export async function updateSettingsDB(data: {
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    currency?: string;
    taxRate?: number;
}) {
    return updateBusinessInfoDB(data);
}
