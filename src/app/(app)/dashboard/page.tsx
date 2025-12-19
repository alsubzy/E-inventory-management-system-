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
import { getDashboardStats } from '@/lib/actions/analytics';
import { format } from 'date-fns';
import { Product, Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  totalRevenue: number;
  recentTransactions: Transaction[];
  lowStockItems: (Product & { totalQuantity: number; isLowStock: boolean })[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(getDashboardStats() as any);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
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

        {/* Active Suppliers Card (Mocked for UI) */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Active Suppliers</span>
              <div className="p-2.5 bg-sky-500 rounded-xl text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">24</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-[11px] font-medium text-slate-500">2 new this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waste Reduction Card (Mocked for UI) */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Waste Reduction</span>
              <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 mb-1">5.2%</span>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-2">
                <span className="text-sm font-bold text-emerald-500">↑ 2.3%</span>
                <span className="text-[11px] font-medium text-slate-400">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inventory Status Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-500">Inventory Status</span>
              <div className="p-2.5 bg-[#0D5D5D] rounded-xl text-white">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Total Items</span>
                <span className="text-2xl font-bold text-slate-900">{stats.totalProducts}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0D5D5D] w-[75%]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-3">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-rose-400 uppercase">Low Stock</p>
                    <p className="text-base font-bold text-rose-600">{stats.lowStockCount}</p>
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-amber-400 uppercase">Expired</p>
                    <p className="text-base font-bold text-amber-600">7</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {stats.lowStockItems.slice(0, 2).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <Badge className="bg-rose-100 text-rose-600 border-none hover:bg-rose-200">Low stock</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Summary Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-500">Orders Summary</span>
              <div className="p-2.5 bg-[#0D5D5D] rounded-xl text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Pending</p>
                    <p className="text-base font-bold text-slate-900">18</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Completed</p>
                    <p className="text-base font-bold text-slate-900">142</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500">7-Day Order Trend</span>
                </div>
                <div className="h-24 flex items-end gap-1 px-2">
                  {[40, 60, 45, 70, 85, 65, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 hover:bg-emerald-500 transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">Javed Islam</span>
                    <span className="text-[10px] text-slate-400">#253200</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-600 border-none">New order</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Overview Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-500">Supplier Overview</span>
              <div className="p-2.5 bg-[#0D5D5D] rounded-xl text-white">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Active Suppliers</p>
                  <p className="text-xl font-bold text-slate-900">24</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Performance Score</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-emerald-500">4.8</span>
                    <span className="text-amber-400 text-sm">★</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-4">Recent Deliveries</p>
                <div className="space-y-4">
                  {[
                    { name: 'Fresh Farms Co.', status: 'Delivered', time: 'Today', statusColor: 'bg-emerald-100 text-emerald-600' },
                    { name: 'Dairy Best Ltd.', status: 'In Transit', time: 'Yesterday', statusColor: 'bg-sky-100 text-sky-600' },
                    { name: 'Meat Masters', status: 'Delivered', time: '2 days ago', statusColor: 'bg-emerald-100 text-emerald-600' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.time}</span>
                      </div>
                      <Badge className={cn("border-none px-2 py-0.5 text-[10px]", s.statusColor)}>{s.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales & Expenses Card */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Sales & Expenses</h3>
                  <p className="text-[10px] text-slate-400">6-month financial overview</p>
                </div>
                <div className="p-2.5 bg-[#0D5D5D] rounded-xl text-white">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F3F8F8] p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Total Sales</span>
                  <span className="text-2xl font-bold text-slate-900 mb-2">$331,000</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-500">↑ 12.5%</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Total Expenses</span>
                  <span className="text-2xl font-bold text-slate-900 mb-2">$213,000</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-500">↑ 8.3%</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 h-48 w-full bg-slate-50/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                <span className="text-xs text-slate-400 font-medium italic">Financial Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food Waste Tracker Card */}
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-500">Food Waste Tracker</span>
              <div className="p-2.5 bg-rose-500 rounded-xl text-white">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Current Month Waste</p>
                  <p className="text-2xl font-bold text-slate-900">5.2%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Reduction from last month</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-sm font-bold">-2.3%</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-4">6-Month Trend</p>
                <div className="h-24 flex items-end gap-1.5 px-1">
                  {[60, 50, 45, 40, 35, 30].map((h, i) => (
                    <div key={i} className="flex-1 bg-rose-100 hover:bg-rose-400 transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
