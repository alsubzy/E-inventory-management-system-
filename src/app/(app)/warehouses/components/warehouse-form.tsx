'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseSchema, WarehouseFormValues } from '@/lib/schemas';
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
import { createWarehouseDB, updateWarehouseDB } from '@/lib/actions/warehouses-db';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WarehouseFormProps {
    initialData?: WarehouseFormValues & { id: string };
    onSuccess?: () => void;
}

export function WarehouseForm({ initialData, onSuccess }: WarehouseFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: initialData || {
            name: '',
            location: '',
            contact: '',
        },
    });

    async function onSubmit(data: WarehouseFormValues) {
        setLoading(true);
        try {
            const warehouseData = {
                name: data.name,
                location: data.location,
            };

            let result;
            if (initialData) {
                result = await updateWarehouseDB(initialData.id, warehouseData);
            } else {
                result = await createWarehouseDB(warehouseData);
            }

            if (result.success) {
                toast({ title: initialData ? 'Warehouse updated successfully' : 'Warehouse created successfully' });
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warehouse Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Main Warehouse" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Downtown, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Update Warehouse' : 'Create Warehouse'}
                </Button>
            </form>
        </Form>
    );
}
