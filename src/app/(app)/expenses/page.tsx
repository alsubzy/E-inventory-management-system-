"use client"

import { useEffect, useState } from "react"
import { getExpensesDB, getExpenseCategoriesDB, createExpenseDB } from "@/lib/actions/expenses-db"
import { getAccountsDB } from "@/lib/actions/accounts-db"
import { DataTable } from "@/app/(app)/products/components/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const expenseSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be positive"),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    reference: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    accountId: z.string().optional(), // Optional, but recommended if paid
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

export default function ExpensesPage() {
    const [data, setData] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: 0,
            categoryId: "",
            description: "",
            reference: "",
            date: new Date().toISOString().split('T')[0],
            accountId: "none"
        }
    })

    async function loadData() {
        setLoading(true)
        const [expensesRes, categoriesRes, accountsRes] = await Promise.all([
            getExpensesDB(),
            getExpenseCategoriesDB(),
            getAccountsDB()
        ])

        if (expensesRes.success && expensesRes.apiData) {
            setData(expensesRes.apiData)
        }
        if (categoriesRes.success && categoriesRes.apiData) {
            setCategories(categoriesRes.apiData)
        }
        if (accountsRes.success && accountsRes.apiData) {
            setAccounts(accountsRes.apiData)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    async function onSubmit(values: ExpenseFormValues) {
        const payload = {
            ...values,
            date: new Date(values.date),
            accountId: values.accountId === "none" ? undefined : values.accountId
        }

        const res = await createExpenseDB(payload)

        if (res.success) {
            toast({ title: "Expense Added" })
            setOpen(false)
            form.reset({
                amount: 0,
                categoryId: "",
                description: "",
                reference: "",
                date: new Date().toISOString().split('T')[0],
                accountId: "none"
            })
            // Wait a bit for revalidatePath to propagate if needed, or just reload data
            await loadData()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Expenses" description="Track business expenses.">
                <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Expense</DialogTitle>
                                <DialogDescription>Record a new business expense.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((c) => (
                                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accountId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Paid From (Optional)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || "none"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- None (Petty Cash/Other) --</SelectItem>
                                                        {accounts.map((a) => (
                                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency} {a.balance})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Optional description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reference</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Receipt #" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Expense
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </PageHeader>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="description" searchPlaceholder="Search expenses..." />
            )}
        </div>
    )
}
