'use client';
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
  Clock,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const countryData = [
  { country: 'USA', value: 29, color: '#3B82F6' },
  { country: 'Russia', value: 20, color: '#3B82F6' },
  { country: 'Asia', value: 14, color: '#3B82F6' },
  { country: 'Africa', value: 10, color: '#3B82F6' },
  { country: 'Australia', value: 8, color: '#3B82F6' },
];

const salesData = [
  { name: 'Sat', sales: 4000 },
  { name: 'Sun', sales: 6000 },
  { name: 'Mon', sales: 5000 },
  { name: 'Tue', sales: 8000 },
  { name: 'Wed', sales: 7000 },
  { name: 'Thu', sales: 9000 },
  { name: 'Fri', sales: 7500 },
];

const shippingProducts = [
  {
    trackingId: '#TD74844',
    destination: 'USA',
    destinationFlag: '/flags/us.svg',
    customer: 'Esther Howard',
    customerAvatar: 'https://i.pravatar.cc/150?u=esther',
    deliveryTime: '5-7 days',
    carrier: 'Kathryn Murphy',
    carrierAvatar: 'https://i.pravatar.cc/150?u=kathryn',
    cost: '$12.50',
    status: 'On Delivery',
    statusVariant: 'default',
  },
  {
    trackingId: '#TD74845',
    destination: 'Canada',
    destinationFlag: '/flags/ca.svg',
    customer: 'Guy Hawkins',
    customerAvatar: 'https://i.pravatar.cc/150?u=guy',
    deliveryTime: '7-10 days',
    carrier: 'Courtney Henry',
    carrierAvatar: 'https://i.pravatar.cc/150?u=courtney',
    cost: '$20.00',
    status: 'Shipped',
    statusVariant: 'success',
  },
  {
    trackingId: '#TD74846',
    destination: 'India',
    destinationFlag: '/flags/in.svg',
    customer: 'Wade Warren',
    customerAvatar: 'https://i.pravatar.cc/150?u=wade',
    deliveryTime: '2-3 days',
    carrier: 'Arlene McCoy',
    carrierAvatar: 'https://i.pravatar.cc/150?u=arlene',
    cost: '$15.00',
    status: 'Pending',
    statusVariant: 'warning',
  },
    {
    trackingId: '#TD74847',
    destination: 'UK',
    destinationFlag: '/flags/gb.svg',
    customer: 'Leslie Alexander',
    customerAvatar: 'https://i.pravatar.cc/150?u=leslie',
    deliveryTime: '3 days',
    carrier: 'Theresa Webb',
    carrierAvatar: 'https://i.pravatar.cc/150?u=theresa',
    cost: '$10.00',
    status: 'Shipped',
    statusVariant: 'success',
  },
];


const StatusBadge = ({variant, children} : {variant: 'default' | 'success' | 'warning', children: React.ReactNode}) => {
    const baseClasses = "text-xs font-medium me-2 px-3 py-1 rounded-full";
    const variants = {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={`${baseClasses} ${variants[variant]}`}>{children}</Badge>
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$73,890</div>
            <p className="text-xs text-green-500 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              +16%
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Shipment
            </CardTitle>
             <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">389</div>
            <p className="text-xs text-red-500 flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" />
              -24%
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Order</CardTitle>
             <div className="p-2 bg-gray-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1865</div>
            <p className="text-xs text-green-500 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              +12%
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Delivery Time
            </CardTitle>
             <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.5 Days</div>
            <p className="text-xs text-green-500 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              +18%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Country Redistribution</CardTitle>
            <Button variant="ghost" size="sm">Yearly <ArrowDown className="h-4 w-4 ml-2" /></Button>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countryData} layout="vertical" margin={{ left: -10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="country" hide />
                  <Bar dataKey="value" fill="#3B82F6" barSize={15} radius={[0, 10, 10, 0]}>
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
                {countryData.map(item => (
                    <div key={item.country} className="flex items-center justify-between text-sm">
                        <span>{item.country}</span>
                        <span className="font-semibold">{item.value} M</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 rounded-xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-lg font-semibold">Total Sales</CardTitle>
                <p className="text-sm text-muted-foreground"><span className="text-primary font-bold">$84,994.80</span> <span className="text-green-500 text-xs">+16%</span> from last month</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Weekly <ArrowDown className="h-4 w-4 ml-2" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal /></Button>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(value) => `${value/1000}h`} />
                <Tooltip 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="bg-white p-2 border rounded-lg shadow-lg">
                                <p className="text-sm font-bold text-blue-600">{`Sales: $${payload[0].value?.toLocaleString()}`}</p>
                            </div>
                            );
                        }
                        return null;
                    }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="rounded-xl border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Shipping Products List</CardTitle>
            <div className="flex items-center gap-4">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-9 h-10 rounded-lg bg-gray-50 border-gray-200" />
                </div>
                <Button variant="outline" className="h-10 rounded-lg">See All</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Delivery Time</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shippingProducts.map(product => (
                        <TableRow key={product.trackingId}>
                            <TableCell className="font-bold">{product.trackingId}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Image src={product.destinationFlag} width={24} height={16} alt={product.destination} data-ai-hint="country flag" />
                                    <span>{product.destination}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={product.customerAvatar} alt={product.customer} data-ai-hint="person avatar" />
                                        <AvatarFallback>{product.customer.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{product.customer}</span>
                                </div>
                            </TableCell>
                            <TableCell>{product.deliveryTime}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={product.carrierAvatar} alt={product.carrier} data-ai-hint="person avatar" />
                                        <AvatarFallback>{product.carrier.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{product.carrier}</span>
                                </div>
                            </TableCell>
                            <TableCell>{product.cost}</TableCell>
                            <TableCell>
                                <StatusBadge variant={product.statusVariant as any}>{product.status}</StatusBadge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
