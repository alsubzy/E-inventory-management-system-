"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createPartyLedgerEntryDB } from "./parties-db"

// Payment Operations

export async function processPaymentDB(data: {
    partyId: string
    amount: number
    method: string
    type: string
    reference?: string
    date: Date
    note?: string
}) {
    try {
        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                partyId: data.partyId,
                amount: data.amount,
                method: data.method,
                type: data.type,
                reference: data.reference,
                date: data.date,
                note: data.note,
            },
            include: { party: true }
        })

        // Create ledger entry
        const ledgerType: 'DEBIT' | 'CREDIT' = data.type === 'PAYMENT_RECEIVED' ? 'CREDIT' : 'DEBIT'
        const description = `Payment ${data.type.replace('_', ' ')} (${data.method})`

        await createPartyLedgerEntryDB({
            partyId: data.partyId,
            paymentId: payment.id,
            date: data.date,
            description,
            type: ledgerType,
            amount: data.amount
        })

        revalidatePath('/payments')
        revalidatePath('/parties')
        revalidatePath(`/parties/${data.partyId}`)

        return { success: true, payment }
    } catch (error) {
        console.error('Error processing payment:', error)
        return { success: false, error: 'Failed to process payment' }
    }
}

export async function getPaymentsDB(partyId?: string) {
    try {
        const where = partyId ? { partyId } : {}

        const payments = await prisma.payment.findMany({
            where,
            include: {
                party: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, payments }
    } catch (error) {
        console.error('Error fetching payments:', error)
        return { success: false, error: 'Failed to fetch payments', payments: [] }
    }
}

export async function getPaymentDB(id: string) {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                party: true,
                ledgers: true
            }
        })

        if (!payment) {
            return { success: false, error: 'Payment not found' }
        }

        return { success: true, payment }
    } catch (error) {
        console.error('Error fetching payment:', error)
        return { success: false, error: 'Failed to fetch payment' }
    }
}

export async function deletePaymentDB(id: string) {
    try {
        // Get payment details
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { ledgers: true }
        })

        if (!payment) {
            return { success: false, error: 'Payment not found' }
        }

        // Delete related ledger entries
        await prisma.partyLedger.deleteMany({
            where: { paymentId: id }
        })

        // Recalculate party balance
        const remainingLedgers = await prisma.partyLedger.findMany({
            where: { partyId: payment.partyId },
            orderBy: { date: 'asc' }
        })

        let runningBalance = 0
        for (const ledger of remainingLedgers) {
            runningBalance += ledger.type === 'DEBIT' ? ledger.amount : -ledger.amount
            await prisma.partyLedger.update({
                where: { id: ledger.id },
                data: { runningBalance }
            })
        }

        // Update party balance
        await prisma.party.update({
            where: { id: payment.partyId },
            data: { currentBalance: runningBalance }
        })

        // Delete payment
        await prisma.payment.delete({
            where: { id }
        })

        revalidatePath('/payments')
        revalidatePath('/parties')
        revalidatePath(`/parties/${payment.partyId}`)

        return { success: true }
    } catch (error) {
        console.error('Error deleting payment:', error)
        return { success: false, error: 'Failed to delete payment' }
    }
}
