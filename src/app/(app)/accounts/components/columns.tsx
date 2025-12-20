"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { format } from "date-fns"
import Link from "next/link"

export type Account = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
    isDefault: boolean
}

export const columns: ColumnDef<Account>[] = [
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
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Account Name" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <Link href={`/accounts/${row.original.id}`} className="font-medium hover:underline">
                        {row.getValue("name")}
                    </Link>
                    {row.original.isDefault && (
                        <span className="text-[10px] text-muted-foreground">Default</span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>
    },
    {
        accessorKey: "balance",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Balance" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("balance"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: row.original.currency || "USD",
            }).format(amount)

            return <div className={`font-medium ${amount < 0 ? 'text-red-500' : 'text-green-600'}`}>{formatted}</div>
        },
    },
]
