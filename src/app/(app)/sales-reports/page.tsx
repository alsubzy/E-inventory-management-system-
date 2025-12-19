'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesReportDB, getBestSellingProductsDB } from '@/lib/actions/sales-db';
import { TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function SalesReportsPage() {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [report, setReport] = useState<any>(null);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        const [reportRes, bestRes] = await Promise.all([
            getSalesReportDB({
                startDate: startOfDay(dateRange.from),
                endDate: endOfDay(dateRange.to)
            }),
            getBestSellingProductsDB(10)
        ]);

        if (reportRes.success) setReport(reportRes.report);
        if (bestRes.success) setBestSellers(bestRes.products);
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sales Reports"
                description="Detailed analysis of your sales performance."
            >
                <DateRangePicker
                    date={{ from: dateRange.from, to: dateRange.to }}
                    onDateChange={(range: any) => range?.from && range?.to && setDateRange({ from: range.from, to: range.to })}
                />
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">
                            {loading ? "..." : formatCurrency(report?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Units Sold</CardTitle>
                        <Package className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">
                            {loading ? "..." : report?.totalSales || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Products across all sales</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Average Sale</CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">
                            {loading ? "..." : formatCurrency((report?.totalRevenue || 0) / (report?.totalSales || 1))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Revenue per transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Top Product</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate">
                            {loading ? "..." : bestSellers[0]?.product?.name || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">By revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Best Selling Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                                ) : bestSellers.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-8">No data found</TableCell></TableRow>
                                ) : bestSellers.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium underline decoration-primary/30 underline-offset-4">{item.product.name}</TableCell>
                                        <TableCell className="text-right">{item._sum.quantity}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">{formatCurrency(item._sum.totalAmount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Period Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                            <span className="text-sm font-medium">Reporting From</span>
                            <span className="text-sm font-bold font-mono">{format(dateRange.from, 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                            <span className="text-sm font-medium">Reporting To</span>
                            <span className="text-sm font-bold font-mono">{format(dateRange.to, 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg text-primary border border-primary/20">
                            <span className="text-sm font-black uppercase tracking-widest">Total Revenue</span>
                            <span className="text-xl font-black">{formatCurrency(report?.totalRevenue || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
