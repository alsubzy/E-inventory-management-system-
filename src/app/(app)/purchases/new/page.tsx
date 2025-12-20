import { PurchaseForm } from "../components/purchase-form"
import { getPartiesDB } from "@/lib/actions/parties-db"
import { getWarehousesDB } from "@/lib/actions/warehouses-db"
import { getProductsDB } from "@/lib/actions/products-db"
import { getAccountsDB } from "@/lib/actions/accounts-db"
import { PageHeader } from "@/components/page-header"

export default async function NewPurchasePage() {
    const partiesRes = await getPartiesDB()
    const warehousesRes = await getWarehousesDB()
    const productsRes = await getProductsDB()
    const accountsRes = await getAccountsDB()

    // Filter for suppliers only
    const suppliers = partiesRes.success
        ? partiesRes.parties?.filter(p => ['SUPPLIER', 'BOTH'].includes(p.type))
        : []

    const warehouses = warehousesRes.success ? warehousesRes.warehouses : []
    const products = productsRes.success ? productsRes.products : []
    const accounts = accountsRes.success && accountsRes.apiData ? accountsRes.apiData : []

    return (
        <div className="space-y-6">
            <PageHeader
                title="New Purchase Order"
                description="Create a new purchase order to add stock."
            />
            <div className="max-w-4xl mx-auto">
                <PurchaseForm
                    suppliers={suppliers}
                    warehouses={warehouses}
                    products={products}
                    accounts={accounts}
                />
            </div>
        </div>
    )
}
