'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createTransaction } from '@/lib/actions/transactions';
import { getProducts } from '@/lib/actions/products';
import { getWarehouses } from '@/lib/actions/warehouses';
import { Product, Warehouse } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface TransactionFormProps {
    onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        setProducts(getProducts() as Product[]);
        setWarehouses(getWarehouses() as Warehouse[]);
    }, []);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'IN',
            items: [{ productId: '', quantity: 1, price: 0 }],
            fromWarehouseId: '',
            toWarehouseId: '',
            reference: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const type = form.watch('type');

    async function onSubmit(data: TransactionFormValues) {
        setLoading(true);
        try {
            createTransaction(data);
            toast({ title: 'Transaction recorded successfully' });
            form.reset();
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="IN">Stock In (Purchase)</SelectItem>
                                        <SelectItem value="OUT">Stock Out (Sale)</SelectItem>
                                        <SelectItem value="TRANSFER">Warehouse Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference / Invoice #</FormLabel>
                                <FormControl>
                                    <Input placeholder="PO-12345" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(type === 'OUT' || type === 'TRANSFER') && (
                        <FormField
                            control={form.control}
                            name="fromWarehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Warehouse</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select warehouse" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map(w => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {(type === 'IN' || type === 'TRANSFER') && (
                        <FormField
                            control={form.control}
                            name="toWarehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Warehouse</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select warehouse" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map(w => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Items</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.productId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {products.map(p => (
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
                                            <FormLabel>Qty</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="w-32">
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive mb-1"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Transaction
                </Button>
            </form>
        </Form>
    );
}
