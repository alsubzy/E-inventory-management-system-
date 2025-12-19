'use client';

import { useEffect, useState, use } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail, ArrowLeft, CreditCard } from 'lucide-react';
import { getSaleByIdDB } from '@/lib/actions/sales-db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SaleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSale = async () => {
            const result = await getSaleByIdDB(id);
            if (result.success) {
                setSale(result.sale);
            }
            setLoading(false);
        };
        loadSale();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="p-8 text-center">Loading sale details...</div>;
    }

    if (!sale) {
        return <div className="p-8 text-center text-destructive">Sale not found.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between no-print">
                <Button variant="ghost" asChild>
                    <Link href="/sales">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to History
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <Card className="print:shadow-none print:border-none shadow-xl border-t-4 border-t-primary">
                <CardContent className="p-8">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-primary mb-2">INVOICE</h1>
                            <p className="text-muted-foreground font-mono text-sm">{sale.invoice?.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold">E-Inventory Admin</h2>
                            <p className="text-sm text-muted-foreground">123 Business Street, Tech City</p>
                            <p className="text-sm text-muted-foreground">contact@e-inventory.com</p>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Billing Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Billed To</p>
                            <p className="font-bold text-lg">{sale.customer?.name}</p>
                            <p className="text-sm text-muted-foreground">{sale.customer?.address}</p>
                            <p className="text-sm text-muted-foreground">{sale.customer?.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Sale Details</p>
                            <p className="text-sm"><strong>Date:</strong> {format(new Date(sale.createdAt), 'MMMM dd, yyyy')}</p>
                            <p className="text-sm"><strong>Sale #:</strong> {sale.saleNumber}</p>
                            <p className="text-sm flex items-center justify-end gap-2 mt-2">
                                <strong>Status:</strong>
                                <Badge variant={sale.paymentStatus === 'PAID' ? 'success' : 'warning'}>{sale.paymentStatus}</Badge>
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <div className="grid grid-cols-12 gap-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground border-b pb-2 px-2">
                            <div className="col-span-6">Item Description</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        {sale.items.map((item: any) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 py-4 px-2 border-b text-sm items-center">
                                <div className="col-span-6">
                                    <p className="font-bold">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                </div>
                                <div className="col-span-2 text-center font-medium">{item.quantity}</div>
                                <div className="col-span-2 text-right font-medium">${item.unitPrice.toFixed(2)}</div>
                                <div className="col-span-2 text-right font-bold">${item.totalAmount.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${sale.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-destructive">-${sale.discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">${sale.taxAmount.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-black pt-2">
                                <span>Total</span>
                                <span className="text-primary">${sale.netAmount.toFixed(2)}</span>
                            </div>

                            <div className="bg-muted/50 p-3 rounded-lg mt-4 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold uppercase tracking-tighter">Amount Paid</span>
                                    <span className="font-bold">${sale.paidAmount.toFixed(2)}</span>
                                </div>
                                {sale.balanceAmount > 0 && (
                                    <div className="flex justify-between text-xs text-destructive">
                                        <span className="font-bold uppercase tracking-tighter">Balance Due</span>
                                        <span className="font-bold">${sale.balanceAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-center text-muted-foreground text-xs">
                        <p className="font-bold mb-2">Thank you for your business!</p>
                        <p>If you have any questions about this invoice, please contact us.</p>
                    </div>
                </CardContent>
            </Card>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print\:shadow-none {
            box-shadow: none !important;
          }
          .print\:border-none {
            border: none !important;
          }
        }
      `}</style>
        </div>
    );
}
