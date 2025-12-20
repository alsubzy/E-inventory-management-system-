import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    sku: z.string().min(3, "SKU must be at least 3 characters"),
    barcode: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().optional(),
    unit: z.string().min(1, "Unit is required"),
    costPrice: z.coerce.number().min(0, "Cost price must be positive"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
    image: z.string().url().optional().or(z.literal("")),
    minStock: z.coerce.number().min(0, "Minimum stock must be positive"),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export const warehouseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(2, "Location must be at least 2 characters"),
    contact: z.string().optional(),
});

export const transactionSchema = z.object({
    type: z.enum(["IN", "OUT", "TRANSFER"]),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
    })).min(1, "At least one item required"),
    fromWarehouseId: z.string().optional(),
    toWarehouseId: z.string().optional(),
    partyId: z.string().optional(),
    reference: z.string().optional(),
});

export const partySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["SUPPLIER", "CUSTOMER", "BOTH"]),
    phone: z.string().min(5, "Valid phone number required"),
    email: z.string().email("Invalid email address").or(z.literal("")),
    address: z.string().min(5, "Address must be at least 5 characters"),
    openingBalance: z.coerce.number(),
    balanceType: z.enum(["DEBIT", "CREDIT"]),
    paymentTerms: z.enum(["CASH", "CREDIT", "NET_DAYS"]),
    creditLimit: z.coerce.number().min(0, "Credit limit must be positive"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const paymentSchema = z.object({
    partyId: z.string().min(1, "Party is required"),
    amount: z.number().positive("Amount must be positive"),
    method: z.enum(["CASH", "BANK", "MOBILE_MONEY"]),
    type: z.enum(["PAYMENT_MADE", "PAYMENT_RECEIVED", "ADVANCE"]),
    reference: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type PartyFormValues = z.infer<typeof partySchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
