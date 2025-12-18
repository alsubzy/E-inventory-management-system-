import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProducts } from '@/lib/data';
import { ArrowDownToDot, ArrowUpFromDot } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Record new stock arrivals and sales."
      />
      <Tabs defaultValue="stock-in" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
          <TabsTrigger value="stock-in">
            <ArrowDownToDot className="mr-2 h-4 w-4" /> Stock In
          </TabsTrigger>
          <TabsTrigger value="stock-out">
            <ArrowUpFromDot className="mr-2 h-4 w-4" /> Stock Out (Sale)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stock-in">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Record Stock In</CardTitle>
              <CardDescription>
                Log new inventory received from suppliers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-in">Product</Label>
                <Select>
                  <SelectTrigger id="product-in">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity-in">Quantity</Label>
                <Input id="quantity-in" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Input id="supplier" placeholder="e.g., Global Electronics" />
              </div>
              <Button className="w-full">Add Stock</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stock-out">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Record Sale (Stock Out)</CardTitle>
              <CardDescription>
                Create a sales order. Stock will be updated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-out">Product</Label>
                <Select>
                  <SelectTrigger id="product-out">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity-out">Quantity</Label>
                <Input id="quantity-out" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer (Optional)</Label>
                <Input id="customer" placeholder="e.g., John Doe" />
              </div>
              <Button className="w-full">Create Sale & Invoice</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
