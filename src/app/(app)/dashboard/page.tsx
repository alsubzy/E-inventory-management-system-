'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getDashboardStatsDB } from '@/lib/actions/analytics-db';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const result = await getDashboardStatsDB();
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <p className="text-muted-foreground font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Total Revenue</span>
              <div className="p-2 bg-emerald-100 rounded-full">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-normal px-1 py-0 h-5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </Badge>
                <span className="text-xs text-slate-400">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Net Profit</span>
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.netProfit)}</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-normal px-1 py-0 h-5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2%
                </Badge>
                <span className="text-xs text-slate-400">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Total Expenses</span>
              <div className="p-2 bg-rose-100 rounded-full">
                <CreditCard className="h-4 w-4 text-rose-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalExpenses)}</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] font-normal px-1 py-0 h-5">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1%
                </Badge>
                <span className="text-xs text-slate-400">vs last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Inventory Value</span>
              <div className="p-2 bg-amber-100 rounded-full">
                <Package className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalStockValue)}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-slate-400">{stats.totalProducts} Items in stock</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 rounded-xl border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Activity
              <ShoppingBag className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions?.slice(0, 6).map((tx: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      tx.type === 'PURCHASE' ? "bg-emerald-100 text-emerald-600" :
                        tx.type === 'SALE' ? "bg-blue-100 text-blue-600" :
                          "bg-amber-100 text-amber-600"
                    )}>
                      {tx.type[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 clamp-1">{tx.productName || 'Unknown Product'}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        {tx.warehouseName} • {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-sm font-semibold block",
                      tx.type === 'PURCHASE' ? "text-emerald-600" : "text-slate-900"
                    )}>
                      {tx.type === 'PURCHASE' ? '+' : '-'}{Math.abs(tx.quantity)}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm">No recent transactions</div>
              )}
            </div>

            <button className="w-full mt-4 text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1 pt-3 border-t">
              View All Activity <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                Low Stock Alerts
              </CardTitle>
              <Badge variant="destructive" className="rounded-full px-2">
                {stats.lowStockCount} Items
              </Badge>
            </div>
            <CardDescription>Items falling below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lowStockItems?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-200 mb-2" />
                <p className="text-sm">Stock levels are healthy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockItems?.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-rose-50/30 border-rose-100">
                    <div>
                      <p className="font-medium text-sm text-slate-700">{item.name}</p>
                      <p className="text-xs text-rose-500">Only {item.quantity} units left</p>
                    </div>
                    <Badge variant="outline" className="border-rose-200 text-rose-600 bg-white">
                      Restock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warehouse Distribution (Placeholder for now) */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Warehouse Distribution</CardTitle>
            <CardDescription>Stock volume by warehouse</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center text-slate-400 text-sm italic">
            Chart coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
