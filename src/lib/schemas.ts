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
    contact: z.string().min(5, "Contact details required"),
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
    reference: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
