import { getOnlineOrderDB } from "@/lib/actions/online-orders-db"
import { OrderDetailsView } from "../components/order-details-view"
import { PageHeader } from "@/components/page-header"

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const res = await getOnlineOrderDB(params.id)

    if (!res.success || !res.apiData) {
        return <div className="p-8">Order not found</div>
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Order Details" description="View and manage customer order." />
            <OrderDetailsView order={res.apiData} />
        </div>
    )
}
