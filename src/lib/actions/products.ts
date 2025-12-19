"use client";

import { Product } from "@/lib/types";
import { productSchema, ProductFormValues } from "@/lib/schemas";
import { storageManager } from "../local-storage";

export function createProduct(data: ProductFormValues) {
    const validated = productSchema.parse(data);
    const product: Product = {
        id: crypto.randomUUID(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    storageManager.createProduct(product);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user', // No server-side auth info in localStorage manager yet
        action: "PRODUCT_CREATE",
        timestamp: new Date().toISOString(),
        details: `Created product: ${product.name} (SKU: ${product.sku})`,
    });

    return { success: true, id: product.id };
}

export function getProducts() {
    return storageManager.getProducts();
}

export function getProduct(id: string) {
    return storageManager.getProducts().find(p => p.id === id) || null;
}

export function updateProduct(id: string, data: Partial<ProductFormValues>) {
    storageManager.updateProduct(id, data);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: "PRODUCT_UPDATE",
        timestamp: new Date().toISOString(),
        details: `Updated product ID: ${id}. Changes: ${JSON.stringify(data)}`,
    });
    return { success: true };
}

export function deleteProduct(id: string) {
    storageManager.deleteProduct(id);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: "PRODUCT_DELETE",
        timestamp: new Date().toISOString(),
        details: `Deleted product ID: ${id}`,
    });
    return { success: true };
}
