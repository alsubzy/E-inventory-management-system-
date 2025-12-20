"use client"

import { useEffect, useState } from "react"
import { getStockTransfersDB } from "@/lib/actions/stock-transfer-db"
import { DataTable } from "@/app/(app)/products/components/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default function StockTransfersPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const res = await getStockTransfersDB()
            if (res.success && res.apiData) {
                setData(res.apiData)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    return (
        <div className="space-y-8">
            <PageHeader title="Stock Transfers" description="Move inventory between warehouses.">
                <Link href="/stock-transfers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Transfer
                    </Button>
                </Link>
            </PageHeader>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="transferNumber" searchPlaceholder="Search Transfers..." />
            )}
        </div>
    )
}
