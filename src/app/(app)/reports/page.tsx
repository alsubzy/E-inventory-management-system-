import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { salesByDay } from '@/lib/data';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

export default function ReportsPage() {
    const totalRevenue = 54230;
    const totalCost = 32500;
    const netProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Analyze your sales, profit, and loss."
      />
      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                  <p className="text-xs text-muted-foreground">+18.3% from last month</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(netProfit)}</div>
                  <p className="text-xs text-muted-foreground">+22.4% from last month</p>
              </CardContent>
          </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Summary</CardTitle>
          <CardDescription>
            A chart showing sales performance over the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesByDay}>
                 <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  cursor={{fill: 'hsl(var(--muted))'}}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
