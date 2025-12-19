'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, CreditCard, Trash2, Plus, Minus, Tag, Wallet } from 'lucide-react';
import { getProductsWithStockDB } from '@/lib/actions/products-db';
import { getPartiesDB } from '@/lib/actions/parties-db';
import { getWarehousesDB } from '@/lib/actions/warehouses-db';
import { createSaleDB } from '@/lib/actions/sales-db';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<string>('');
    const { toast } = useToast();

    const loadProducts = async (whId?: string) => {
        const res = await getProductsWithStockDB(whId);
        if (res.success) setProducts(res.products);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const [custRes, whRes] = await Promise.all([
                getPartiesDB(),
                getWarehousesDB()
            ]);
            if (custRes.success) setCustomers(custRes.parties.filter((p: any) => p.type === 'CUSTOMER' || p.type === 'BOTH'));
            if (whRes.success) {
                setWarehouses(whRes.warehouses);
                if (whRes.warehouses.length > 0) {
                    setSelectedWarehouse(whRes.warehouses[0].id);
                    loadProducts(whRes.warehouses[0].id);
                }
            }
        };
        loadInitialData();
    }, []);

    const handleWarehouseChange = (whId: string) => {
        setSelectedWarehouse(whId);
        loadProducts(whId);
        setCart([]);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: any) => {
        if (product.totalStock <= 0) {
            toast({ title: "Out of Stock", description: "This product is unavailable in the selected warehouse.", variant: "destructive" });
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.totalStock) {
                    toast({ title: "Limit Reached", description: `Only ${product.totalStock} units available.`, variant: "destructive" });
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const product = products.find(p => p.id === productId);
                const newQty = item.quantity + delta;
                if (newQty > (product?.totalStock || 0)) {
                    toast({ title: "Limit Reached", description: `Only ${product?.totalStock} units available.`, variant: "destructive" });
                    return item;
                }
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const netAmount = Math.max(0, subtotal - discountAmount);

    // Default paid amount to net amount if not manually edited
    const finalPaidAmount = paidAmount === '' ? netAmount : parseFloat(paidAmount);

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
            return;
        }
        if (!selectedWarehouse) {
            toast({ title: "Error", description: "Please select a warehouse", variant: "destructive" });
            return;
        }
        if (cart.length === 0) {
            toast({ title: "Error", description: "Cart is empty", variant: "destructive" });
            return;
        }

        setLoading(true);
        const saleData = {
            customerId: selectedCustomer,
            warehouseId: selectedWarehouse,
            totalAmount: subtotal,
            discountAmount: discountAmount,
            taxAmount: 0,
            netAmount: netAmount,
            paidAmount: finalPaidAmount,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.sellingPrice,
                discountAmount: 0,
                taxAmount: 0,
                totalAmount: item.sellingPrice * item.quantity
            }))
        };

        const result = await createSaleDB(saleData);
        if (result.success) {
            toast({ title: "Success", description: "Sale completed successfully" });
            setCart([]);
            setSelectedCustomer('');
            setDiscountAmount(0);
            setPaidAmount('');
            loadProducts(selectedWarehouse);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <PageHeader title="Point of Sale" description="Create sales with partial payments and discounts." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden mt-4">
                <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-none bg-background/50">
                        <CardHeader className="pb-3 px-0">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        className="pl-9 h-11 bg-background"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                                    <SelectTrigger className="w-[200px] h-11 bg-background">
                                        <SelectValue placeholder="Warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto px-0 py-2">
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map(product => (
                                    <Card
                                        key={product.id}
                                        className={cn(
                                            "cursor-pointer hover:border-primary transition-all duration-200 group overflow-hidden border-2",
                                            product.totalStock <= 0 ? "opacity-60 grayscale cursor-not-allowed" : "hover:shadow-md"
                                        )}
                                        onClick={() => addToCart(product)}
                                    >
                                        <CardContent className="p-0">
                                            <div className="w-full h-32 bg-muted flex items-center justify-center relative">
                                                <ShoppingCart className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <Badge
                                                    variant={product.totalStock <= 5 ? "destructive" : "secondary"}
                                                    className="absolute top-2 right-2"
                                                >
                                                    {product.totalStock} left
                                                </Badge>
                                            </div>
                                            <div className="p-3">
                                                <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{product.sku}</p>
                                                <p className="font-extrabold text-lg text-primary mt-1">${product.sellingPrice.toFixed(2)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-sm">
                        <CardHeader className="border-b pb-4 bg-muted/20">
                            <div className="pt-0">
                                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                    <SelectTrigger className="h-11 border-2 font-bold">
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                    <ShoppingCart className="h-12 w-12 opacity-20 mb-2" />
                                    <p className="text-sm">Cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-background p-3 rounded-lg border shadow-sm space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">${item.sellingPrice.toFixed(2)}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="font-bold text-sm text-primary">
                                                    ${(item.sellingPrice * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <div className="p-4 bg-background border-t space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> Discount
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-9 font-bold"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                        <Wallet className="h-3 w-3" /> Amount Paid
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder={netAmount.toFixed(2)}
                                        className="h-9 font-bold text-primary"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-xl pt-1">
                                    <span>Total Due</span>
                                    <span className="text-primary">${netAmount.toFixed(2)}</span>
                                </div>
                                {finalPaidAmount < netAmount && (
                                    <div className="flex justify-between text-xs font-bold text-destructive">
                                        <span>Balance Due</span>
                                        <span>${(netAmount - finalPaidAmount).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <Button className="w-full h-12 text-lg font-black shadow-lg" size="lg" disabled={loading || cart.length === 0} onClick={handleCheckout}>
                                {loading ? "Processing..." : <><CreditCard className="mr-2 h-5 w-5" /> Complete Order</>}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
