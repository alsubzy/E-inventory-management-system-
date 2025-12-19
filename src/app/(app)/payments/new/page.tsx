'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PaymentFormValues } from '@/lib/schemas';
import { storageManager } from '@/lib/local-storage';
import { Party, Payment } from '@/lib/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function NewPaymentPage() {
    const router = useRouter();
    const [parties, setParties] = useState<Party[]>([]);

    useEffect(() => {
        setParties(storageManager.getParties());
    }, []);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            partyId: '',
            amount: 0,
            method: 'CASH',
            type: 'PAYMENT_RECEIVED',
            date: new Date().toISOString().split('T')[0],
            reference: '',
            note: '',
        },
    });

    const onSubmit = (values: PaymentFormValues) => {
        const payment: Payment = {
            id: Math.random().toString(36).substr(2, 9),
            ...values,
            date: new Date(values.date).toISOString(),
        };
        storageManager.processPayment(payment);
        toast({ title: 'Payment recorded successfully' });
        router.push('/payments');
        router.refresh();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Record Payment</h1>
                <p className="text-sm text-slate-500">Record a new payment from a customer or to a supplier</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="partyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Party (Supplier/Customer)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select party" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {parties.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PAYMENT_RECEIVED">Payment Received (Customer)</SelectItem>
                                                    <SelectItem value="PAYMENT_MADE">Payment Made (Supplier)</SelectItem>
                                                    <SelectItem value="ADVANCE">Advance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="BANK">Bank</SelectItem>
                                                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference / Check #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ref-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional payment note" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" className="bg-[#0D5D5D] hover:bg-[#0D5D5D]/90">
                                    Record Payment
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
