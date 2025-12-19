'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/schemas';
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
import { createProductDB, updateProductDB } from '@/lib/actions/products-db';
import { getCategoriesDB } from '@/lib/actions/categories-db';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
    initialData?: ProductFormValues & { id: string };
    onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function loadCategories() {
            const result = await getCategoriesDB();
            if (result.success) {
                setCategories(result.categories);
            }
        }
        loadCategories();
    }, []);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: '',
            sku: '',
            barcode: '',
            category: '',
            unit: '',
            costPrice: 0,
            sellingPrice: 0,
            minStock: 5,
            description: '',
            image: '',
        },
    });

    async function onSubmit(data: ProductFormValues) {
        setLoading(true);
        try {
            const productData = {
                name: data.name,
                sku: data.sku,
                barcode: data.barcode,
                unit: data.unit,
                costPrice: Number(data.costPrice),
                sellingPrice: Number(data.sellingPrice),
                description: data.description,
                reorderLevel: Number(data.minStock || 0),
                categoryId: data.category || undefined,
            };

            let result;
            if (initialData) {
                result = await updateProductDB(initialData.id, productData);
            } else {
                result = await createProductDB({ ...productData, sku: data.sku });
            }

            if (result.success) {
                toast({ title: initialData ? 'Product updated successfully' : 'Product created successfully' });
                form.reset();
                onSuccess?.();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Something went wrong',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Wireless Mouse" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input placeholder="WM-1023" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                    <SelectItem value="ltr">Liters (ltr)</SelectItem>
                                    <SelectItem value="box">Boxes (box)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cost Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Selling Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Min Stock Level</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="col-span-1 md:col-span-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
