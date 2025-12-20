'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBusinessInfoDB } from '@/lib/actions/settings-db';

// Business Info Type
export interface BusinessInfo {
    id: string;
    businessName: string;
    legalName: string | null;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    currency: string;
    taxRate: number;
    taxId: string | null;
    invoiceFooter: string | null;
    socialLinks: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface BusinessInfoContextType {
    businessInfo: BusinessInfo | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const BusinessInfoContext = createContext<BusinessInfoContextType | undefined>(undefined);

export function BusinessInfoProvider({ children }: { children: ReactNode }) {
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBusinessInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getBusinessInfoDB();

            if (result.success && result.data) {
                setBusinessInfo(result.data as BusinessInfo);
            } else {
                setError(result.error || 'Failed to load business information');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            console.error('Error loading business info:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBusinessInfo();
    }, []);

    const refresh = async () => {
        await loadBusinessInfo();
    };

    return (
        <BusinessInfoContext.Provider value={{ businessInfo, isLoading, error, refresh }}>
            {children}
        </BusinessInfoContext.Provider>
    );
}

export function useBusinessInfo() {
    const context = useContext(BusinessInfoContext);
    if (context === undefined) {
        throw new Error('useBusinessInfo must be used within a BusinessInfoProvider');
    }
    return context;
}
