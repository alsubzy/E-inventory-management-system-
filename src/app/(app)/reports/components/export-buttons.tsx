'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportToCSV } from '@/lib/utils/export';
import { getInventoryReportData, getSalesReportData } from '@/lib/actions/reports';

export function ExportButtons() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleExport = async (type: 'inventory' | 'sales') => {
        setLoading(type);
        try {
            const data = type === 'inventory'
                ? await getInventoryReportData()
                : await getSalesReportData();

            exportToCSV(data, `${type}_report`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('inventory')} disabled={!!loading}>
                {loading === 'inventory' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export Inventory
            </Button>
            <Button variant="outline" onClick={() => handleExport('sales')} disabled={!!loading}>
                {loading === 'sales' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export Sales
            </Button>
        </div>
    );
}
