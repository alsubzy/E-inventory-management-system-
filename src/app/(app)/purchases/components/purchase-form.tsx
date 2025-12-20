"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPurchaseDB } from "@/lib/actions/purchases-db"
import { toast } from "@/hooks/use-toast"
import { Loader2, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

const purchaseSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    warehouseId: z.string().min(1, "Warehouse is required"),
    date: z.date().default(new Date()),
    status: z.enum(['PENDING', 'RECEIVED', 'COMPLETED']).default('COMPLETED'),
    notes: z.string().optional(),
    paidAmount: z.coerce.number().min(0).optional(),
    accountId: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        unitCost: z.coerce.number().min(0, "Cost must be positive"),
    })).min(1, "At least one item is required"),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

interface PurchaseFormProps {
    suppliers: any[]
    warehouses: any[]
    products: any[]
    accounts: any[]
}

export function PurchaseForm({ suppliers, warehouses, products, accounts }: PurchaseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            status: 'COMPLETED',
            items: [{ productId: "", quantity: 1, unitCost: 0 }],
            paidAmount: 0,
            date: new Date(),
            accountId: ""
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Calculate total amount
    const items = form.watch("items")
    const totalAmount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitCost || 0)), 0)

    async function onSubmit(data: PurchaseFormValues) {
        setLoading(true)
        try {
            // If accountId is empty string, make it undefined
            const payload = {
                ...data,
                accountId: data.accountId === "" ? undefined : data.accountId
            }
            const result = await createPurchaseDB(payload)
            if (result.success) {
                toast({
                    title: "Purchase Created",
                    description: "Purchase order has been successfully created.",
                })
                router.push('/purchases')
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create purchase",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="warehouseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warehouse</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="RECEIVED">Received</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end border-b pb-4 mb-4">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.productId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Product</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select product" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {products.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-20">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unitCost`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Cost</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-10 w-10 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>

                            <div className="flex justify-end pt-4 border-t">
                                <div className="text-right">
                                    <span className="text-sm text-muted-foreground mr-2">Total Amount:</span>
                                    <span className="text-xl font-bold">
                                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                                <FormLabel className="mt-2 text-nowrap">Amount Paid</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" step="0.01" className="w-32" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 min-w-[200px]">
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pay From (Optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">-- None --</SelectItem>
                                            {accounts.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.balance})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea placeholder="Notes..." className="h-10 resize-none py-2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Purchase
                    </Button>
                </div>
            </form>
        </Form>
    )
}
