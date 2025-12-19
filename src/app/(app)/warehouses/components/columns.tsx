'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type Warehouse } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { deleteWarehouse } from '@/lib/actions/warehouses';
import { toast } from '@/hooks/use-toast';

export const columns: ColumnDef<Warehouse>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: 'Warehouse Name',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'location',
        header: 'Location',
    },
    {
        accessorKey: 'contact',
        header: 'Contact',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const warehouse = row.original;

            const onDelete = async () => {
                if (confirm('Are you sure you want to delete this warehouse?')) {
                    await deleteWarehouse(warehouse.id);
                    toast({ title: 'Warehouse deleted' });
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
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(warehouse.id)}
                            >
                                Copy warehouse ID
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Warehouse</DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={onDelete}
                            >
                                Delete Warehouse
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
