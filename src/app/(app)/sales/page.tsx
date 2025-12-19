'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { getSalesDB } from '@/lib/actions/sales-db';
import Link from 'next/link';

export default function SalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSales = async () => {
        setLoading(true);
        const result = await getSalesDB();
        if (result.success) {
            setSales(result.sales);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSales();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sales History"
                description="View and manage all sales transactions."
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild>
                        <Link href="/pos">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Sale
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground bg-background rounded-xl border border-dashed">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading sales history...
                </div>
            ) : (
                <DataTable columns={columns(loadSales)} data={sales} />
            )}
        </div>
    );
}
