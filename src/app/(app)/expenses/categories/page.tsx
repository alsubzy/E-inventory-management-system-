"use client"

import { useEffect, useState } from "react"
import { getExpenseCategoriesDB, createExpenseCategoryDB } from "@/lib/actions/expenses-db"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function ExpenseCategoriesPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    async function loadData() {
        setLoading(true)
        const res = await getExpenseCategoriesDB()
        if (res.success && res.apiData) {
            setData(res.apiData)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        const res = await createExpenseCategoryDB({ name })
        if (res.success) {
            toast({ title: "Category Created" })
            setOpen(false)
            setName("")
            loadData()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Expense Categories" description="Manage categories for your expenses.">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Category</DialogTitle>
                            <DialogDescription>Create a new expense category.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rent, Utilities"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Category
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Usage Count</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description || '-'}</TableCell>
                            <TableCell className="text-right">{category._count?.expenses || 0}</TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && !loading && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                No categories found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
