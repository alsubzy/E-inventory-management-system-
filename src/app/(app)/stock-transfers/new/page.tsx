import { StockTransferForm } from "../components/stock-transfer-form"
import { getWarehousesDB } from "@/lib/actions/warehouses-db"
import { getProductsDB } from "@/lib/actions/products-db"
import { PageHeader } from "@/components/page-header"

export default async function NewStockTransferPage() {
    const warehousesRes = await getWarehousesDB()
    const productsRes = await getProductsDB()

    const warehouses = warehousesRes.success ? warehousesRes.warehouses : []
    const products = productsRes.success ? productsRes.products : []

    return (
        <div className="space-y-6">
            <PageHeader
                title="New Stock Transfer"
                description="Move inventory between warehouses."
            />
            <div className="max-w-4xl mx-auto">
                <StockTransferForm
                    warehouses={warehouses}
                    products={products}
                />
            </div>
        </div>
    )
}
