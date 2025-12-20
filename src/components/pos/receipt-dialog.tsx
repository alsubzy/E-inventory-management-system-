'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface ReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: any;
}

export function ReceiptDialog({ open, onOpenChange, sale }: ReceiptDialogProps) {
    if (!sale) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content');
        if (!printContent) return;

        const printWindow = window.open('', '', 'height=600,width=400');
        if (!printWindow) return;

        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            @media print {
                body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
                .text-center { text-center: center; text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .border-t { border-top: 1px dashed #000; margin: 10px 0; }
                .flex { display: flex; justify-content: space-between; }
                .mb-1 { margin-bottom: 4px; }
                .mt-2 { margin-top: 8px; }
            }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">Sale Completed!</DialogTitle>
                    <DialogDescription className="text-center">
                        Invoice #{sale.saleNumber} has been generated successfully.
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
                    <div id="receipt-content" className="receipt-view font-mono text-sm">
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-lg uppercase">E-Inventory POS</h3>
                            <p className="text-xs">123 Business Street, Tech City</p>
                            <p className="text-xs">Phone: +1 234 567 890</p>
                        </div>

                        <Separator className="mb-3" />

                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-xs">
                                <span>Ref:</span>
                                <span className="font-bold">{sale.saleNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Date:</span>
                                <span>{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Customer:</span>
                                <span>{sale.customer?.name || 'Walk-in Customer'}</span>
                            </div>
                        </div>

                        <Separator className="mb-3" />

                        <div className="space-y-2 mb-4">
                            {sale.items?.map((item: any) => (
                                <div key={item.id} className="space-y-1">
                                    <div className="flex justify-between font-bold">
                                        <span className="truncate flex-1 pr-2">{item.product?.name || 'Product'}</span>
                                        <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="border-dashed mb-3" />

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${sale.totalAmount.toFixed(2)}</span>
                            </div>
                            {sale.discountAmount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Discount</span>
                                    <span>-${sale.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {sale.taxAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>Tax ({sale.taxRate?.toFixed(1) || '0'}%)</span>
                                    <span>${sale.taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-1">
                                <span>Total</span>
                                <span>${sale.netAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-green-600">
                                <span>Paid</span>
                                <span>${sale.paidAmount.toFixed(2)}</span>
                            </div>
                            {sale.balanceAmount > 0 && (
                                <div className="flex justify-between font-bold text-destructive underline decoration-dotted">
                                    <span>Balance Due</span>
                                    <span>${sale.balanceAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-6 pt-4 border-t border-dashed">
                            <p className="text-xs italic font-bold">Thank you for your business!</p>
                            <p className="text-[10px] mt-1">Please keep this receipt for returns.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
