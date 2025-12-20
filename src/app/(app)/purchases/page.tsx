"use client"

import { useEffect, useState } from "react"
import { getPurchasesDB } from "@/lib/actions/purchases-db"
import { DataTable } from "@/app/(app)/products/components/data-table" // Reuse generic DataTable
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default function PurchasesPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const res = await getPurchasesDB()
            if (res.success && res.apiData) {
                setData(res.apiData)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    return (
        <div className="space-y-8">
            <PageHeader title="Purchases" description="Manage purchase orders and incoming stock.">
                <Link href="/purchases/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Purchase
                    </Button>
                </Link>
            </PageHeader>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="purchaseNumber" searchPlaceholder="Search PO..." />
            )}
        </div>
    )
}
