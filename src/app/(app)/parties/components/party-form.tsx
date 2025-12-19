'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partySchema, PartyFormValues } from '@/lib/schemas';
import { storageManager } from '@/lib/local-storage';
import { Party } from '@/lib/types';
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
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PartyFormProps {
    initialData?: Party;
}

export function PartyForm({ initialData }: PartyFormProps) {
    const router = useRouter();
    const form = useForm<PartyFormValues>({
        resolver: zodResolver(partySchema),
        defaultValues: initialData || {
            name: '',
            type: 'CUSTOMER',
            phone: '',
            email: '',
            address: '',
            openingBalance: 0,
            balanceType: 'DEBIT',
            paymentTerms: 'CASH',
            creditLimit: 0,
            status: 'ACTIVE',
        },
    });

    const onSubmit = (values: PartyFormValues) => {
        if (initialData) {
            storageManager.updateParty(initialData.id, {
                ...values,
                updatedAt: new Date().toISOString(),
            });
        } else {
            const newParty: Party = {
                id: Math.random().toString(36).substr(2, 9),
                ...values,
                currentBalance: values.balanceType === 'DEBIT' ? values.openingBalance : -values.openingBalance,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            storageManager.createParty(newParty);
        }
        router.push('/parties');
        router.refresh();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Party Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="SUPPLIER">Supplier</SelectItem>
                                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                                        <SelectItem value="BOTH">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="openingBalance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Opening Balance</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="balanceType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Balance Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DEBIT">Debit (Receivable)</SelectItem>
                                        <SelectItem value="CREDIT">Credit (Payable)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Terms</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select terms" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="CREDIT">Credit</SelectItem>
                                        <SelectItem value="NET_DAYS">Net Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="creditLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Credit Limit</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
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
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" className="bg-[#0D5D5D] hover:bg-[#0D5D5D]/90">
                        {initialData ? 'Update Party' : 'Create Party'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
