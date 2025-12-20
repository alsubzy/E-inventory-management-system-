'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { getSaleByIdDB, createSalesReturnDB } from '@/lib/actions/sales-db';
import { getAccountsDB } from '@/lib/actions/accounts-db';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { format } from 'date-fns';

export default function ReturnsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [returnItems, setReturnItems] = useState<Record<string, { quantity: number; reason: string }>>({});
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        // Find sale by saleNumber (simple mock for now, ideally search by number)
        // For this demo, we use the ID if provided or just search
        const res = await getSaleByIdDB(searchQuery);
        if (res.success) {
            setSale(res.sale);
            // Initialize return items
            const items: any = {};
            res.sale.items.forEach((i: any) => {
                items[i.id] = { quantity: 0, reason: '' };
            });
            setReturnItems(items);

            // Load accounts for refund
            const accRes = await getAccountsDB();
            if (accRes.success && accRes.apiData) setAccounts(accRes.apiData);
        } else {
            toast({ title: "Not Found", description: "Sale not found. Please check the Invoice/Sale ID.", variant: "destructive" });
        }
        setLoading(false);
    };

    const updateReturnQty = (itemId: string, qty: number, max: number) => {
        const val = Math.min(max, Math.max(0, qty));
        setReturnItems(prev => ({ ...prev, [itemId]: { ...prev[itemId], quantity: val } }));
    };

    const handleReturn = async () => {
        const itemsToReturn = Object.entries(returnItems)
            .filter(([_, data]) => data.quantity > 0)
            .map(([id, data]) => ({
                saleItemId: id,
                productId: sale.items.find((i: any) => i.id === id).productId,
                quantity: data.quantity,
                reason: data.reason
            }));

        if (itemsToReturn.length === 0) {
            toast({ title: "Error", description: "Please select items to return", variant: "destructive" });
            return;
        }

        setLoading(true);
        const res = await createSalesReturnDB({
            saleId: sale.id,
            items: itemsToReturn,
            refundAmount,
            accountId: selectedAccount
        });

        if (res.success) {
            toast({ title: "Success", description: "Return processed successfully" });
            setSale(null);
            setSearchQuery('');
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/sales"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <PageHeader title="Sales Returns" description="Process full or partial refunds and return items to stock." />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lookup Sale</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter Sale ID or Invoice Number..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {sale && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Items in Sale #{sale.saleNumber}</CardTitle>
                                <p className="text-sm text-muted-foreground">Ordered on {format(new Date(sale.createdAt), 'PPP')}</p>
                            </div>
                            <Badge variant={sale.status === 'RETURNED' ? 'destructive' : 'default'}>{sale.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Returned</TableHead>
                                        <TableHead className="w-[100px] text-right">Return Qty</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.product.name}
                                                <p className="text-[10px] text-muted-foreground uppercase">{item.product.sku}</p>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right text-destructive font-bold">{item.returnedQuantity}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="h-8 text-right"
                                                    value={returnItems[item.id]?.quantity || 0}
                                                    onChange={(e) => updateReturnQty(item.id, parseInt(e.target.value) || 0, item.quantity - item.returnedQuantity)}
                                                    max={item.quantity - item.returnedQuantity}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Reason..."
                                                    className="h-8 text-xs"
                                                    value={returnItems[item.id]?.reason || ''}
                                                    onChange={(e) => setReturnItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], reason: e.target.value } }))}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Refund Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase">Refund Amount</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="font-bold text-lg text-primary"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Amount to be given back to the customer.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase">Source Account</label>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} (${a.balance})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Customer Balance:</span>
                                        <span className="font-bold">${sale.customer.currentBalance.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Note: Remaining credit (Sale Total - Refund) will be deducted from customer's dues automatically.
                                    </p>
                                </div>

                                <Button className="w-full gap-2" variant="destructive" size="lg" onClick={handleReturn} disabled={loading}>
                                    <RotateCcw className="h-4 w-4" />
                                    Process Return
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
