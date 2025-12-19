'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'MMM d, yyyy HH:mm'),
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            return (
                <Badge variant={type === 'IN' ? 'success' : type === 'OUT' ? 'destructive' : 'outline'}>
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'reference',
        header: 'Reference',
    },
    {
        id: 'items_count',
        header: 'Items',
        cell: ({ row }) => row.original.items.length,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="secondary">{row.getValue('status')}</Badge>,
    },
];
