"use client"

import { useEffect, useState } from "react"
import { getAccountsDB } from "@/lib/actions/accounts-db"
import { DataTable } from "@/app/(app)/products/components/data-table"
import { columns } from "./components/columns"
import { AccountDialog } from "./components/account-dialog"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Building2, Smartphone } from "lucide-react"

export default function AccountsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const res = await getAccountsDB()
            if (res.success && res.apiData) {
                setData(res.apiData)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const totalCash = data.filter(a => a.type === 'CASH').reduce((sum, a) => sum + a.balance, 0)
    const totalBank = data.filter(a => a.type === 'BANK').reduce((sum, a) => sum + a.balance, 0)
    const totalMobile = data.filter(a => a.type === 'MOBILE_MONEY').reduce((sum, a) => sum + a.balance, 0)

    const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

    return (
        <div className="space-y-8">
            <PageHeader title="Cash & Bank" description="Manage your financial accounts and balances.">
                <AccountDialog />
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCash)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bank</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBank)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalMobile)}</div>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search Accounts..." />
            )}
        </div>
    )
}
