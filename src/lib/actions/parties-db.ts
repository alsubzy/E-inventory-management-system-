"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Party (Customer/Supplier) CRUD Operations

export async function createPartyDB(data: {
    name: string
    type: string
    phone: string
    email?: string
    address: string
    openingBalance?: number
    balanceType: 'DEBIT' | 'CREDIT'
    status?: string
}) {
    try {
        const currentBalance = data.balanceType === 'DEBIT'
            ? (data.openingBalance || 0)
            : -(data.openingBalance || 0)

        const party = await prisma.party.create({
            data: {
                name: data.name,
                type: data.type,
                phone: data.phone,
                email: data.email,
                address: data.address,
                openingBalance: data.openingBalance || 0,
                currentBalance,
                status: data.status || 'ACTIVE',
            }
        })

        // Create opening balance ledger entry if non-zero
        if (data.openingBalance && data.openingBalance !== 0) {
            await prisma.partyLedger.create({
                data: {
                    partyId: party.id,
                    date: new Date(),
                    description: 'Opening Balance',
                    type: data.balanceType,
                    amount: data.openingBalance,
                    runningBalance: currentBalance
                }
            })
        }

        revalidatePath('/parties')
        return { success: true, party }
    } catch (error) {
        console.error('Error creating party:', error)
        return { success: false, error: 'Failed to create party' }
    }
}

export async function getPartiesDB() {
    try {
        const parties = await prisma.party.findMany({
            include: {
                _count: {
                    select: {
                        payments: true,
                        ledgers: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, parties }
    } catch (error) {
        console.error('Error fetching parties:', error)
        return { success: false, error: 'Failed to fetch parties', parties: [] }
    }
}

export async function getPartyDB(id: string) {
    try {
        const party = await prisma.party.findUnique({
            where: { id },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                ledgers: {
                    orderBy: { date: 'desc' },
                    take: 20,
                    include: { payment: true }
                }
            }
        })

        if (!party) {
            return { success: false, error: 'Party not found' }
        }

        return { success: true, party }
    } catch (error) {
        console.error('Error fetching party:', error)
        return { success: false, error: 'Failed to fetch party' }
    }
}

export async function updatePartyDB(id: string, data: Partial<{
    name: string
    type: string
    phone: string
    email: string
    address: string
    status: string
}>) {
    try {
        const party = await prisma.party.update({
            where: { id },
            data
        })

        revalidatePath('/parties')
        revalidatePath(`/parties/${id}`)
        return { success: true, party }
    } catch (error) {
        console.error('Error updating party:', error)
        return { success: false, error: 'Failed to update party' }
    }
}

export async function deletePartyDB(id: string) {
    try {
        // Check if party has transactions
        const ledgerCount = await prisma.partyLedger.count({
            where: { partyId: id }
        })

        if (ledgerCount > 0) {
            // Soft delete by setting status to INACTIVE
            await prisma.party.update({
                where: { id },
                data: { status: 'INACTIVE' }
            })

            revalidatePath('/parties')
            return { success: true, message: 'Party set to inactive (has transactions)' }
        }

        // Hard delete if no transactions
        await prisma.party.delete({
            where: { id }
        })

        revalidatePath('/parties')
        return { success: true }
    } catch (error) {
        console.error('Error deleting party:', error)
        return { success: false, error: 'Failed to delete party' }
    }
}

// Party Ledger Operations

export async function getPartyLedgerDB(partyId: string) {
    try {
        const ledger = await prisma.partyLedger.findMany({
            where: { partyId },
            include: {
                payment: true
            },
            orderBy: { date: 'desc' }
        })

        return { success: true, ledger }
    } catch (error) {
        console.error('Error fetching party ledger:', error)
        return { success: false, error: 'Failed to fetch ledger', ledger: [] }
    }
}

export async function createPartyLedgerEntryDB(data: {
    partyId: string
    paymentId?: string
    transactionId?: string
    date: Date
    description: string
    type: 'DEBIT' | 'CREDIT'
    amount: number
}) {
    try {
        // Get current balance
        const party = await prisma.party.findUnique({
            where: { id: data.partyId },
            select: { currentBalance: true }
        })

        if (!party) {
            return { success: false, error: 'Party not found' }
        }

        const balanceChange = data.type === 'DEBIT' ? data.amount : -data.amount
        const newBalance = party.currentBalance + balanceChange

        // Create ledger entry
        const ledgerEntry = await prisma.partyLedger.create({
            data: {
                partyId: data.partyId,
                paymentId: data.paymentId,
                transactionId: data.transactionId,
                date: data.date,
                description: data.description,
                type: data.type,
                amount: data.amount,
                runningBalance: newBalance
            }
        })

        // Update party balance
        await prisma.party.update({
            where: { id: data.partyId },
            data: { currentBalance: newBalance }
        })

        revalidatePath('/parties')
        revalidatePath(`/parties/${data.partyId}`)

        return { success: true, ledgerEntry }
    } catch (error) {
        console.error('Error creating ledger entry:', error)
        return { success: false, error: 'Failed to create ledger entry' }
    }
}
