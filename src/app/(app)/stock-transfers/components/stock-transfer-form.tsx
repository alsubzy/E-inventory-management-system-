"use client"

import { useState } from "react"
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
import { createStockTransferDB } from "@/lib/actions/stock-transfer-db"
import { toast } from "@/hooks/use-toast"
import { Loader2, Trash2, Plus, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

const transferSchema = z.object({
    sourceWarehouseId: z.string().min(1, "Source Warehouse is required"),
    destWarehouseId: z.string().min(1, "Destination Warehouse is required"),
    date: z.date().default(new Date()),
    status: z.enum(['COMPLETED', 'CANCELLED']).default('COMPLETED'),
    notes: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    })).min(1, "At least one item is required"),
}).refine((data) => data.sourceWarehouseId !== data.destWarehouseId, {
    message: "Source and Destination warehouses cannot be the same",
    path: ["destWarehouseId"],
})

type TransferFormValues = z.infer<typeof transferSchema>

interface StockTransferFormProps {
    warehouses: any[]
    products: any[]
}

export function StockTransferForm({ warehouses, products }: StockTransferFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            status: 'COMPLETED',
            items: [{ productId: "", quantity: 1 }],
            date: new Date()
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    async function onSubmit(data: TransferFormValues) {
        setLoading(true)
        try {
            const result = await createStockTransferDB(data)
            if (result.success) {
                toast({
                    title: "Transfer Created",
                    description: "Stock transfer has been successfully recored.",
                })
                router.push('/stock-transfers')
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create transfer",
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
                            <CardTitle>Transfer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="sourceWarehouseId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Source Warehouse</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select source" />
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
                                <ArrowRight className="h-4 w-4 mt-8 text-slate-400" />
                                <FormField
                                    control={form.control}
                                    name="destWarehouseId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Destination Warehouse</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select destination" />
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
                            </div>

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
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Transfer notes..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items to Transfer</CardTitle>
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
                                            <FormItem className="w-24">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
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
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1 })}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Transfer
                    </Button>
                </div>
            </form>
        </Form>
    )
}
