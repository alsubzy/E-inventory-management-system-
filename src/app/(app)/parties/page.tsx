'use client';

import { useState, useEffect } from 'react';
import { storageManager } from '@/lib/local-storage';
import { Party, PartyType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { checkRole } from '@/lib/auth';

export default function PartiesPage() {
    const { user } = useUser();
    const [parties, setParties] = useState<Party[]>([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<PartyType | 'ALL'>('ALL');
    const router = useRouter();

    const isAdmin = checkRole(user, ['ADMIN', 'MANAGER']);

    useEffect(() => {
        setParties(storageManager.getParties());
    }, []);

    const filteredParties = parties.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search) ||
            p.email.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getBalanceColor = (balance: number, type: string) => {
        if (balance === 0) return 'text-slate-500';
        return balance > 0 ? 'text-emerald-600' : 'text-rose-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Parties</h1>
                    <p className="text-sm text-slate-500">Manage your suppliers and customers</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => router.push('/parties/new')} className="bg-[#0D5D5D] hover:bg-[#0D5D5D]/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Party
                    </Button>
                )}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="p-4 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search parties..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 border-slate-200 focus-visible:ring-[#0D5D5D]/20"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 border-slate-200 text-slate-600">
                                        <Filter className="mr-2 h-4 w-4" /> {typeFilter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => setTypeFilter('ALL')}>All Types</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('SUPPLIER')}>Suppliers</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('CUSTOMER')}>Customers</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('BOTH')}>Both</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Party Name</TableHead>
                                <TableHead className="font-bold text-slate-700">Type</TableHead>
                                <TableHead className="font-bold text-slate-700">Phone</TableHead>
                                {isAdmin && <TableHead className="font-bold text-slate-700 text-right">Current Balance</TableHead>}
                                <TableHead className="font-bold text-slate-700">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParties.length > 0 ? (
                                filteredParties.map((party) => (
                                    <TableRow key={party.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => router.push(`/parties/${party.id}`)}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{party.name}</span>
                                                <span className="text-xs text-slate-400">{party.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium">
                                                {party.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-medium">{party.phone}</TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${getBalanceColor(party.currentBalance, party.balanceType)}`}>
                                                    ${Math.abs(party.currentBalance).toLocaleString()}
                                                    <span className="text-[10px] ml-1 uppercase">{party.currentBalance >= 0 ? 'Dr' : 'Cr'}</span>
                                                </span>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge className={party.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600 border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                                                {party.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/parties/${party.id}/edit`); }}>Edit</DropdownMenuItem>
                                                    {isAdmin && <DropdownMenuItem className="text-rose-600">Delete</DropdownMenuItem>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-slate-400 font-medium italic">
                                        No parties found
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
