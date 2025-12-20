"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export type Expense = {
    id: string
    amount: number
    date: Date
    description?: string
    category: { name: string }
    reference?: string
}

export const columns: ColumnDef<Expense>[] = [
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
        accessorKey: "category.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.category.name}</Badge>
        )
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
    },
    {
        accessorKey: "reference",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Reference" />
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)

            return <div className="font-medium text-red-600">{formatted}</div>
        },
    },
]
