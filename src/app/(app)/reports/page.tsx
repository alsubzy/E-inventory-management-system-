'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';
import { getDashboardStats } from '@/lib/actions/analytics';
import { ExportButtons } from './components/export-buttons';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  if (!stats) return <div className="p-8 text-center text-muted-foreground">Loading report data...</div>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Analyze your sales, profit, and loss."
      >
        <ExportButtons />
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total sales revenue to date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Value of inventory at cost price
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit (Est.)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue * 0.4)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated 40% margin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Valuation</CardTitle>
            <CardDescription>Detailed breakdown of stock value by item.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download a full CSV report of your current inventory including cost and selling prices.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Comprehensive log of all outgoing transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all sales transactions with itemized details and customer information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

