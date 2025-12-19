'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { getWarehouses } from '@/lib/actions/warehouses';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { WarehouseForm } from './components/warehouse-form';

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        setWarehouses(getWarehouses());
    }, []);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Warehouses"
                description="Manage your storage locations and branches."
            >
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Warehouse
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Warehouse</DialogTitle>
                            <DialogDescription>
                                Create a new warehouse location to track your inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <WarehouseForm onSuccess={() => setWarehouses(getWarehouses())} />
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <DataTable columns={columns} data={warehouses} searchPlaceholder="Filter warehouses..." />
        </div>
    );
}
