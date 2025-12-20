"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function createAuditLogDB(data: {
    action: string
    entityType: string
    entityId: string
    details?: string
}) {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Unauthorized' }

        const log = await prisma.auditLog.create({
            data: {
                userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                details: data.details
            }
        })

        return { success: true, log }
    } catch (error: any) {
        console.error('Error creating audit log:', error)
        return { success: false, error: error.message }
    }
}

export async function getAuditLogsDB(filters?: {
    userId?: string
    entityType?: string
    action?: string
}) {
    try {
        const where: any = {}
        if (filters?.userId) where.userId = filters.userId
        if (filters?.entityType) where.entityType = filters.entityType
        if (filters?.action) where.action = filters.action

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100 // Default limit
        })

        return { success: true, logs }
    } catch (error: any) {
        console.error('Error fetching audit logs:', error)
        return { success: false, error: error.message }
    }
}
