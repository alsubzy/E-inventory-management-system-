'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockProducts, salesByDay, topSellingProducts, mockSales } from '@/lib/data';
import { DollarSign, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const totalStockValue = mockProducts.reduce(
    (acc, p) => acc + p.costPrice * p.quantity,
    0
  );
  const lowStockItems = mockProducts.filter(
    (p) => p.quantity < p.lowStockThreshold
  ).length;

  const todaySales = mockSales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString()).reduce((acc, sale) => acc + sale.total, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Here's a summary of your inventory and sales."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cost of all items in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              {mockSales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString()).length} orders today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-destructive' : ''}`}>{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items needing your attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                    {mockSales.slice(0,5).map(sale => (
                        <TableRow key={sale.id}>
                            <TableCell>
                                <div className="font-medium">{sale.productName}</div>
                                <div className="text-sm text-muted-foreground md:inline">
                                    {new Date(sale.date).toLocaleString()}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">+{formatCurrency(sale.total)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
