'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type Product } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { deleteProduct } from '@/lib/actions/products';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export const columns: ColumnDef<Product>[] = [
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
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground uppercase">
              {product.name.substring(0, 2)}
            </div>
          )}
          <div className="font-medium">{product.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue('category')}</Badge>;
    },
  },
  {
    accessorKey: 'sellingPrice',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('sellingPrice'));
      return (
        <div className="text-right font-medium">{formatCurrency(amount)}</div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      const onDelete = async () => {
        if (confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(product.id);
          toast({ title: 'Product deleted' });
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
                onClick={() => navigator.clipboard.writeText(product.id)}
              >
                Copy product ID
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Product</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={onDelete}
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

