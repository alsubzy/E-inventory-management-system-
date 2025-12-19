'use client';

import { useState, useEffect, use } from 'react';
import { storageManager } from '@/lib/local-storage';
import { Party, PartyLedgerEntry, Payment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Download,
    Plus,
    Phone,
    Mail,
    MapPin,
    History,
    CreditCard,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { checkRole } from '@/lib/auth';

export default function PartyProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useUser();
    const { id } = use(params);
    const router = useRouter();
    const [party, setParty] = useState<Party | null>(null);
    const [ledger, setLedger] = useState<PartyLedgerEntry[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);

    const isAdmin = checkRole(user, ['ADMIN', 'MANAGER']);

    useEffect(() => {
        const parties = storageManager.getParties();
        const found = parties.find(p => p.id === id);
        if (found) {
            setParty(found);
            setLedger(storageManager.getLedgers(id));
            setPayments(storageManager.getPayments(id));
        }
    }, [id]);

    const downloadStatement = () => {
        if (!party || ledger.length === 0) return;

        const headers = ['Date', 'Description', 'Type', 'Amount', 'Balance'];
        const rows = ledger.map(entry => [
            format(new Date(entry.date), 'yyyy-MM-dd'),
            entry.description,
            entry.type,
            entry.amount,
            entry.runningBalance
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${party.name}_statement_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!party) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="text-slate-600">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parties
                </Button>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <>
                            <Button variant="outline" onClick={() => router.push(`/parties/${id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                            <Button onClick={downloadStatement} className="bg-[#0D5D5D] hover:bg-[#0D5D5D]/90">
                                <Download className="mr-2 h-4 w-4" /> Statement
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Party Info Card */}
                <Card className="border-none shadow-sm h-fit">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="font-bold border-primary/20 text-primary">
                                {party.type}
                            </Badge>
                            <Badge className={party.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600 border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                                {party.status}
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">{party.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{party.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium">{party.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium leading-tight">{party.address}</span>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Financial Summary</p>
                                <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500 font-medium">Current Balance</span>
                                        <span className={`text-lg font-bold ${party.currentBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ${Math.abs(party.currentBalance).toLocaleString()}
                                            <span className="text-[10px] ml-1 uppercase">{party.currentBalance >= 0 ? 'Dr' : 'Cr'}</span>
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Credit Limit</span>
                                        <span className="text-slate-900 font-bold">${party.creditLimit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Payment Terms</span>
                                        <span className="text-primary font-bold">{party.paymentTerms}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Ledger & Transactions Tabs */}
                {isAdmin && (
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="ledger" className="space-y-6">
                            <TabsList className="bg-white p-1 h-12 rounded-xl shadow-sm border-none">
                                <TabsTrigger value="ledger" className="rounded-lg px-6 data-[state=active]:bg-[#0D5D5D] data-[state=active]:text-white data-[state=active]:shadow-md">
                                    <History className="mr-2 h-4 w-4" /> Party Ledger
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="rounded-lg px-6 data-[state=active]:bg-[#0D5D5D] data-[state=active]:text-white data-[state=active]:shadow-md">
                                    <CreditCard className="mr-2 h-4 w-4" /> Payments
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ledger">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                                        <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
                                        <Button variant="outline" size="sm" onClick={() => router.push('/payments/new')} className="border-primary/20 text-primary hover:bg-primary/5">
                                            <Plus className="mr-2 h-4 w-4" /> Add Payment
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-slate-700">Date</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Description</TableHead>
                                                    <TableHead className="font-bold text-slate-700 text-right">Debit (Dr)</TableHead>
                                                    <TableHead className="font-bold text-slate-700 text-right">Credit (Cr)</TableHead>
                                                    <TableHead className="font-bold text-slate-700 text-right">Balance</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ledger.length > 0 ? (
                                                    [...ledger].reverse().map((entry) => (
                                                        <TableRow key={entry.id} className="hover:bg-slate-50/50">
                                                            <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                                                                {format(new Date(entry.date), 'MMM d, yyyy')}
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px] truncate">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-800">{entry.description}</span>
                                                                    <span className="text-[10px] text-slate-400">ID: {entry.transactionId || entry.paymentId || 'N/A'}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right text-rose-600 font-bold">
                                                                {entry.type === 'DEBIT' ? `$${entry.amount.toLocaleString()}` : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right text-emerald-600 font-bold">
                                                                {entry.type === 'CREDIT' ? `$${entry.amount.toLocaleString()}` : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-slate-900">
                                                                ${Math.abs(entry.runningBalance).toLocaleString()}
                                                                <span className="text-[10px] ml-1 uppercase text-slate-400">{entry.runningBalance >= 0 ? 'Dr' : 'Cr'}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium italic">
                                                            No ledger entries found
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="payments">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="border-b border-slate-50">
                                        <CardTitle className="text-lg font-bold">Payment History</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-slate-700">Date</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Method</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Type</TableHead>
                                                    <TableHead className="font-bold text-slate-700 text-right">Amount</TableHead>
                                                    <TableHead className="font-bold text-slate-700">Reference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payments.length > 0 ? (
                                                    [...payments].reverse().map((payment) => (
                                                        <TableRow key={payment.id} className="hover:bg-slate-50/50">
                                                            <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                                                                {format(new Date(payment.date), 'MMM d, yyyy')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none px-3 py-1">
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
                                                        <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium italic">
                                                            No payments found
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}
