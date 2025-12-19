'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  BarChart2,
  Truck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDashboardStatsDB } from '@/lib/actions/analytics-db';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const result = await getDashboardStatsDB();
      if (result.success) {
        setStats(result.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Inventory Value Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Total Inventory Value</span>
              <div className="p-2.5 bg-[#0D5D5D] rounded-xl text-white">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(stats.totalStockValue)}</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-sm font-bold text-emerald-500">↑ 8.2%</span>
                <span className="text-[11px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Monthly Revenue</span>
              <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(stats.totalRevenue)}</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-sm font-bold text-emerald-500">↑ 12.5%</span>
                <span className="text-[11px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Products Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Total Products</span>
              <div className="p-2.5 bg-sky-500 rounded-xl text-white">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">{stats.totalProducts}</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-[11px] font-medium text-slate-500">Active products</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Low Stock Alerts</span>
              <div className="p-2.5 bg-rose-500 rounded-xl text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">{stats.lowStockCount}</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-[11px] font-medium text-rose-500">Requires attention</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Items */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockItems.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center">
                No low stock items
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      <span className="text-xs text-slate-400">SKU: {item.sku}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{item.quantity} units</span>
                      <Badge className="bg-rose-100 text-rose-600 border-none hover:bg-rose-200">
                        Low stock
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center">
                No recent transactions
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{tx.productName}</span>
                      <span className="text-xs text-slate-400">{tx.warehouseName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{tx.quantity} units</span>
                      <Badge className={cn(
                        "border-none",
                        tx.type === 'PURCHASE' && "bg-emerald-100 text-emerald-600",
                        tx.type === 'SALE' && "bg-sky-100 text-sky-600",
                        tx.type === 'ADJUSTMENT' && "bg-amber-100 text-amber-600"
                      )}>
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
