"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export type OnlineOrder = {
    id: string
    orderNumber: string
    customerName: string
    totalAmount: number
    status: string
    createdAt: Date
}

export const columns: ColumnDef<OnlineOrder>[] = [
    {
        accessorKey: "orderNumber",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Order #" />
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
            return <span>{format(new Date(row.getValue("createdAt")), "PPP")}</span>
        }
    },
    {
        accessorKey: "customerName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Customer" />
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
            if (status === 'COMPLETED' || status === 'DELIVERED') variant = "default"
            if (status === 'PENDING') variant = "outline"
            if (status === 'CANCELLED') variant = "destructive"

            return <Badge variant={variant}>{status}</Badge>
        },
    },
    {
        accessorKey: "totalAmount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            return <div className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link href={`/online-orders/${order.id}`}>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
