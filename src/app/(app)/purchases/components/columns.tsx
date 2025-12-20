"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { format } from "date-fns"

export type Purchase = {
    id: string
    purchaseNumber: string
    supplier: { name: string }
    warehouse: { name: string }
    date: Date
    totalAmount: number
    status: string
    paymentStatus: string
}

export const columns: ColumnDef<Purchase>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: "purchaseNumber",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Reference" />
        ),
    },
    {
        accessorKey: "date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
            return <span>{format(new Date(row.getValue("date")), "PPP")}</span>
        }
    },
    {
        accessorKey: "supplier.name", // Access nested data
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Supplier" />
        ),
    },
    {
        accessorKey: "warehouse.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Warehouse" />
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "paymentStatus",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Payment" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as string
            return (
                <Badge variant={status === 'PAID' ? 'outline' : 'destructive'} className={status === 'PAID' ? 'text-green-600 border-green-600' : ''}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalAmount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
]
