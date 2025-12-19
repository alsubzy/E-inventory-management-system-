'use client';

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
import { createWarehouse, updateWarehouse } from '@/lib/actions/warehouses';
import { toast } from '@/hooks/use-toast';
interface WarehouseFormProps {
    initialData?: WarehouseFormValues & { id: string };
    onSuccess?: () => void;
}

export function WarehouseForm({ initialData, onSuccess }: WarehouseFormProps) {
    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: initialData || {
            name: '',
            location: '',
            contact: '',
        },
    });

    async function onSubmit(data: WarehouseFormValues) {
        try {
            if (initialData) {
                updateWarehouse(initialData.id, data);
                toast({ title: 'Warehouse updated successfully' });
            } else {
                createWarehouse(data);
                toast({ title: 'Warehouse created successfully' });
            }
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
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
                <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                                <Input placeholder="+1 234 567 890" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    {initialData ? 'Update Warehouse' : 'Create Warehouse'}
                </Button>
            </form>
        </Form>
    );
}
