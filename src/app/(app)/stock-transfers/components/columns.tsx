"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { format } from "date-fns"

export type StockTransfer = {
    id: string
    transferNumber: string
    sourceWarehouse: { name: string }
    destWarehouse: { name: string }
    date: Date
    status: string
    notes?: string
}

export const columns: ColumnDef<StockTransfer>[] = [
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
        accessorKey: "transferNumber",
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
        accessorKey: "sourceWarehouse.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Source" />
        ),
    },
    {
        accessorKey: "destWarehouse.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Destination" />
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
]
