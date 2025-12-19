"use client";

import { Warehouse } from "@/lib/types";
import { warehouseSchema, WarehouseFormValues } from "@/lib/schemas";
import { storageManager } from "../local-storage";

export function createWarehouse(data: WarehouseFormValues) {
    const validated = warehouseSchema.parse(data);
    const warehouse: Warehouse = {
        id: crypto.randomUUID(),
        ...validated,
        createdAt: new Date().toISOString(),
    };

    storageManager.createWarehouse(warehouse);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: "WAREHOUSE_CREATE",
        timestamp: new Date().toISOString(),
        details: `Created warehouse: ${warehouse.name} (Location: ${warehouse.location})`,
    });

    return { success: true, id: warehouse.id };
}

export function getWarehouses() {
    return storageManager.getWarehouses();
}

export function updateWarehouse(id: string, data: Partial<WarehouseFormValues>) {
    storageManager.updateWarehouse(id, data);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: "WAREHOUSE_UPDATE",
        timestamp: new Date().toISOString(),
        details: `Updated warehouse ID: ${id}. Changes: ${JSON.stringify(data)}`,
    });
    return { success: true };
}

export function deleteWarehouse(id: string) {
    storageManager.deleteWarehouse(id);
    storageManager.createAuditLog({
        id: crypto.randomUUID(),
        userId: 'local-user',
        action: "WAREHOUSE_DELETE",
        timestamp: new Date().toISOString(),
        details: `Deleted warehouse ID: ${id}`,
    });
    return { success: true };
}
