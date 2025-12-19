"use client";

import { AuditLog } from "@/lib/types";
import { storageManager } from "../local-storage";

export function getAuditLogs() {
    return storageManager.getAuditLogs();
}

export function createAuditLog(log: AuditLog) {
    storageManager.createAuditLog(log);
}
