'use client';

import { type ColumnDef } from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown, Eye, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { cancelSaleDB } from '@/lib/actions/sales-db';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);

export const columns = (onRefresh?: () => void): ColumnDef<any>[] => [
    {
        accessorKey: 'saleNumber',
        header: 'Sale #',
        cell: ({ row }) => (
            <Link href={`/sales/${row.original.id}`} className="font-bold text-primary hover:underline">
                {row.getValue('saleNumber')}
            </Link>
        )
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy HH:mm'),
    },
    {
        accessorKey: 'customer.name',
        header: 'Customer',
    },
    {
        accessorKey: 'netAmount',
        header: ({ column }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('netAmount'));
            return (
                <div className="text-right font-medium">{formatCurrency(amount)}</div>
            );
        },
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => {
            const status = row.getValue('paymentStatus') as string;
            return (
                <Badge variant={status === 'PAID' ? 'success' : status === 'PARTIAL' ? 'warning' : 'destructive'}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const sale = row.original;

            const handleCancel = async () => {
                if (!confirm('Are you sure you want to cancel this sale? This will revert stock and customer balance.')) return;

                const res = await cancelSaleDB(sale.id);
                if (res.success) {
                    toast({ title: 'Sale Cancelled', description: 'Stock and balances have been reverted.' });
                    if (onRefresh) onRefresh();
                } else {
                    toast({ title: 'Error', description: res.error, variant: 'destructive' });
                }
            };

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/sales/${sale.id}`} className="flex items-center gap-2 cursor-pointer">
                                    <Eye className="h-4 w-4" />
                                    View Details / Invoice
                                </Link>
                            </DropdownMenuItem>
                            {sale.status !== 'CANCELLED' && (
                                <DropdownMenuItem
                                    className="text-destructive flex items-center gap-2 cursor-pointer"
                                    onClick={handleCancel}
                                >
                                    <Ban className="h-4 w-4" />
                                    Cancel Sale
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
