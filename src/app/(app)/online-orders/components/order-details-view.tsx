"use client"

import { updateOnlineOrderStatusDB } from "@/lib/actions/online-orders-db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface OrderDetailsProps {
    order: any
}

export function OrderDetailsView({ order: initialOrder }: OrderDetailsProps) {
    const [order, setOrder] = useState(initialOrder)
    const [updating, setUpdating] = useState(false)

    async function handleStatusChange(status: string) {
        setUpdating(true)
        const res = await updateOnlineOrderStatusDB(order.id, status)
        if (res.success && res.apiData) {
            setOrder(res.apiData)
            toast({ title: "Status Updated", description: `Order is now ${status}` })
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
        setUpdating(false)
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h2>
                    <div className="text-muted-foreground">
                        Placed on {format(new Date(order.createdAt), "PPP p")}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-medium text-muted-foreground">Name:</span>
                            <span>{order.customerName}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <span>{order.customerEmail}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-medium text-muted-foreground">Phone:</span>
                            <span>{order.customerPhone}</span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr]">
                            <span className="font-medium text-muted-foreground">Address:</span>
                            <span>{order.shippingAddress}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product?.name || 'Unknown Product'}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
