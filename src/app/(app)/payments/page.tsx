'use client';

import { useState, useEffect } from 'react';
import { storageManager } from '@/lib/local-storage';
import { Payment, Party } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { checkRole } from '@/lib/auth';

export default function PaymentsPage() {
    const { user } = useUser();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const isAdmin = checkRole(user, ['ADMIN', 'MANAGER']);

    useEffect(() => {
        setPayments(storageManager.getPayments());
        setParties(storageManager.getParties());
    }, []);

    const getPartyName = (id: string) => parties.find(p => p.id === id)?.name || 'Unknown';

    const filteredPayments = payments.filter(payment =>
        getPartyName(payment.partyId).toLowerCase().includes(search.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
                    <p className="text-sm text-slate-500">History of all incoming and outgoing payments</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => router.push('/payments/new')} className="bg-[#0D5D5D] hover:bg-[#0D5D5D]/90">
                        <Plus className="mr-2 h-4 w-4" /> Record Payment
                    </Button>
                )}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by party or reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-slate-200 focus-visible:ring-[#0D5D5D]/20"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Date</TableHead>
                                <TableHead className="font-bold text-slate-700">Party</TableHead>
                                <TableHead className="font-bold text-slate-700">Method</TableHead>
                                <TableHead className="font-bold text-slate-700">Type</TableHead>
                                <TableHead className="font-bold text-slate-700 text-right">Amount</TableHead>
                                <TableHead className="font-bold text-slate-700">Reference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length > 0 ? (
                                [...filteredPayments].reverse().map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-slate-50/50">
                                        <TableCell className="text-slate-500 font-medium">
                                            {format(new Date(payment.date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-900">
                                            {getPartyName(payment.partyId)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none">
                                                {payment.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={payment.type.includes('RECEIVED') ? 'bg-emerald-100 text-emerald-600 border-none' : 'bg-rose-100 text-rose-600 border-none'}>
                                                {payment.type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">
                                            ${payment.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-medium italic">
                                            {payment.reference || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium italic">
                                        No payments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
