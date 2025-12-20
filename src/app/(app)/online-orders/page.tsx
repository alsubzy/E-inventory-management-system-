"use client"

import { useEffect, useState } from "react"
import { getOnlineOrdersDB } from "@/lib/actions/online-orders-db"
import { DataTable } from "@/app/(app)/products/components/data-table"
import { columns } from "./components/columns"
import { PageHeader } from "@/components/page-header"

export default function OnlineOrdersPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const res = await getOnlineOrdersDB()
            if (res.success && res.apiData) {
                setData(res.apiData)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    return (
        <div className="space-y-8">
            <PageHeader title="Online Orders" description="Manage customer orders from web/app." />

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="orderNumber" searchPlaceholder="Search Order #" />
            )}
        </div>
    )
}
