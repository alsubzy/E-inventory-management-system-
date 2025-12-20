'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, CreditCard, Trash2, Plus, Minus, Tag, Wallet, Package } from 'lucide-react';
import { getProductsWithStockDB } from '@/lib/actions/products-db';
import { getPartiesDB } from '@/lib/actions/parties-db';
import { getWarehousesDB } from '@/lib/actions/warehouses-db';
import { getAccountsDB } from '@/lib/actions/accounts-db';
import { createSaleDB } from '@/lib/actions/sales-db';
import { getSettingsDB } from '@/lib/actions/settings-db';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@/lib/auth';
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
import { ReceiptDialog } from '@/components/pos/receipt-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [barcodeMode, setBarcodeMode] = useState(true);
    const [recentSale, setRecentSale] = useState<any>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [taxRate, setTaxRate] = useState<number>(0);

    const { user } = useUser();
    const userRole = (user?.publicMetadata?.role as UserRole) || 'STAFF';

    // Split Payment State
    const [splitPayments, setSplitPayments] = useState<{ accountId: string; amount: number; method: string }[]>([
        { accountId: '', amount: 0, method: 'CASH' }
    ]);

    const { toast } = useToast();

    const loadProducts = async (whId?: string) => {
        const res = await getProductsWithStockDB(whId);
        if (res.success) setProducts(res.products);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const [custRes, whRes, accRes, catRes, setRes] = await Promise.all([
                getPartiesDB(),
                getWarehousesDB(),
                getAccountsDB(),
                import('@/lib/actions/categories-db').then(m => m.getCategoriesDB()),
                getSettingsDB()
            ]);
            if (custRes.success) {
                const customerList = custRes.parties.filter((p: any) => p.type === 'CUSTOMER' || p.type === 'BOTH');
                setCustomers(customerList);
            }
            if (setRes.success && setRes.apiData) {
                setTaxRate(setRes.apiData.taxRate || 0);
            }
            if (whRes.success) {
                setWarehouses(whRes.warehouses);
                if (whRes.warehouses.length > 0) {
                    setSelectedWarehouse(whRes.warehouses[0].id);
                    loadProducts(whRes.warehouses[0].id);
                }
            }
            if (accRes.success && accRes.apiData) {
                setAccounts(accRes.apiData);
                if (accRes.apiData.length > 0) {
                    setSplitPayments([{ accountId: accRes.apiData[0].id, amount: 0, method: 'CASH' }]);
                }
            }
            if (catRes.success) setCategories(catRes.categories);
        };
        loadInitialData();
    }, []);

    const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const product = products.find(p => p.barcode === searchQuery || p.sku === searchQuery);
            if (product) {
                addToCart(product);
                setSearchQuery('');
            } else {
                toast({ title: "Not Found", description: "No product matches this barcode/SKU", variant: "destructive" });
            }
        }
    };

    const handleWarehouseChange = (whId: string) => {
        setSelectedWarehouse(whId);
        loadProducts(whId);
        setCart([]);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const netAmount = Math.max(0, subtotal - discountAmount + taxAmount);

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

        const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);

        setLoading(true);
        const saleData = {
            customerId: selectedCustomer,
            warehouseId: selectedWarehouse,
            totalAmount: subtotal,
            discountAmount: discountAmount,
            taxAmount: taxAmount,
            netAmount: netAmount,
            paidAmount: totalPaid,
            payments: splitPayments.filter(p => p.amount > 0),
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.sellingPrice,
                discountAmount: 0,
                taxAmount: (item.sellingPrice * item.quantity / subtotal) * taxAmount, // Proportional tax
                totalAmount: (item.sellingPrice * item.quantity)
            }))
        };

        const result = await createSaleDB(saleData);
        if (result.success) {
            toast({ title: "Success", description: "Sale completed successfully" });
            setRecentSale(result.sale);
            setReceiptOpen(true);

            // Reset
            setCart([]);
            setSelectedCustomer('');
            setDiscountAmount(0);
            setPaidAmount('');
            setSplitPayments([{ accountId: accounts[0]?.id || '', amount: 0, method: 'CASH' }]);
            loadProducts(selectedWarehouse);
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const addPaymentLine = () => {
        setSplitPayments(prev => [...prev, { accountId: accounts[0]?.id || '', amount: 0, method: 'CASH' }]);
    };

    const removePaymentLine = (index: number) => {
        setSplitPayments(prev => prev.filter((_, i) => i !== index));
    };

    const updatePaymentLine = (index: number, field: string, value: any) => {
        setSplitPayments(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const totalSplitPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <PageHeader title="Retail POS" description="High-speed Point of Sale with multi-payment and categories." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden mt-4">
                <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-none bg-background/50">
                        <CardHeader className="pb-3 px-0 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={barcodeMode ? "Scan barcode or SKU..." : "Search products..."}
                                        className="pl-9 h-11 bg-background border-2 focus-visible:ring-primary"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleBarcodeSearch}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={barcodeMode ? "default" : "ghost"}
                                        size="sm"
                                        className="h-8"
                                        onClick={() => setBarcodeMode(true)}
                                    >
                                        Barcode
                                    </Button>
                                    <Button
                                        variant={!barcodeMode ? "default" : "ghost"}
                                        size="sm"
                                        className="h-8"
                                        onClick={() => setBarcodeMode(false)}
                                    >
                                        Standard
                                    </Button>
                                </div>
                                <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                                    <SelectTrigger className="w-[180px] h-11 bg-background">
                                        <SelectValue placeholder="Warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <ScrollArea className="w-full whitespace-nowrap pb-1">
                                <div className="flex w-max space-x-2">
                                    <Button
                                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory('all')}
                                        className="rounded-full px-4"
                                    >
                                        All Products
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.id}
                                            variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className="rounded-full px-4"
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto px-0 py-2">
                            {filteredProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <Package className="h-12 w-12 opacity-20 mb-2" />
                                    <p>No products found</p>
                                </div>
                            ) : (
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
                                                <div className="w-full h-28 bg-muted flex items-center justify-center relative">
                                                    <ShoppingCart className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <Badge
                                                        variant={product.totalStock <= product.minStock ? "destructive" : "secondary"}
                                                        className="absolute top-2 right-2"
                                                    >
                                                        {product.totalStock} in stock
                                                    </Badge>
                                                </div>
                                                <div className="p-3">
                                                    <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="font-extrabold text-lg text-primary">${product.sellingPrice.toFixed(2)}</p>
                                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-sm">
                        <CardHeader className="border-b pb-4 bg-muted/20">
                            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                <SelectTrigger className="h-11 border-2 font-bold">
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GUEST" className="font-bold text-primary">Walk-in Customer</SelectItem>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                    <p className="text-sm">Scan items to start</p>
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

                        <div className="p-4 bg-background border-t space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center justify-between">
                                    <span>Payments</span>
                                    <Button variant="ghost" size="sm" className="h-4 p-0 text-primary" onClick={addPaymentLine}>+ Add Method</Button>
                                </label>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                    {splitPayments.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <Select value={p.accountId} onValueChange={(v) => updatePaymentLine(i, 'accountId', v)}>
                                                <SelectTrigger className="h-8 text-xs flex-1">
                                                    <SelectValue placeholder="Account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                className="h-8 w-20 text-xs font-bold"
                                                value={p.amount}
                                                onChange={(e) => updatePaymentLine(i, 'amount', parseFloat(e.target.value) || 0)}
                                            />
                                            {splitPayments.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removePaymentLine(i)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground items-center">
                                    <span>Discount</span>
                                    <Input
                                        type="number"
                                        className="h-6 w-16 text-[10px] p-1 text-right"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground items-center">
                                    <span>Tax ({taxRate}%)</span>
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-2xl pt-2">
                                    <span>Total Due</span>
                                    <span className="text-primary">${netAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold pt-1">
                                    <span>Amount Paid</span>
                                    <span className={cn(totalSplitPaid >= netAmount ? "text-green-600" : "text-amber-600")}>
                                        ${totalSplitPaid.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-black shadow-xl bg-primary hover:bg-primary/90"
                                size="lg"
                                disabled={loading || cart.length === 0}
                                onClick={handleCheckout}
                            >
                                {loading ? "Processing..." : <><CreditCard className="mr-2 h-5 w-5" /> Complete Order</>}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <ReceiptDialog
                open={receiptOpen}
                onOpenChange={setReceiptOpen}
                sale={recentSale}
            />
        </div>
    );
}
