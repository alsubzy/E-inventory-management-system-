"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog"
import { createAccountDB, updateAccountDB } from "@/lib/actions/accounts-db"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(['CASH', 'BANK', 'MOBILE_MONEY']),
    accountNumber: z.string().optional(),
    description: z.string().optional(),
    currency: z.string().min(1, "Currency is required"),
    isDefault: z.boolean().default(false),
    balance: z.coerce.number().optional(), // For initial balance
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountDialogProps {
    account?: any
    trigger?: React.ReactNode
}

export function AccountDialog({ account, trigger }: AccountDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const isEdit = !!account

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: account?.name || "",
            type: account?.type || "CASH",
            accountNumber: account?.accountNumber || "",
            description: account?.description || "",
            currency: account?.currency || "USD",
            isDefault: account?.isDefault || false,
            balance: account?.balance || 0,
        },
    })

    async function onSubmit(data: AccountFormValues) {
        setLoading(true)
        try {
            let result
            if (isEdit) {
                // Don't update balance directly in edit, mostly
                const { balance, ...updateData } = data
                result = await updateAccountDB(account.id, updateData)
            } else {
                result = await createAccountDB(data)
            }

            if (result.success) {
                toast({
                    title: isEdit ? "Account Updated" : "Account Created",
                    description: `Account ${isEdit ? 'updated' : 'created'} successfully.`,
                })
                setOpen(false)
                if (!isEdit) form.reset()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to save account",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant={isEdit ? "ghost" : "default"} size={isEdit ? "icon" : "default"}>
                        {isEdit ? <Edit className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> New Account</>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Account" : "Add Account"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update account details." : "Create a new financial account."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Main Safe, Bank of America" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash</SelectItem>
                                                <SelectItem value="BANK">Bank</SelectItem>
                                                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 1234567890" {...field} />
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
                                        <Textarea placeholder="Notes..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Balance</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormDescription>Starting amount in this account.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="isDefault"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Default Account
                                        </FormLabel>
                                        <FormDescription>
                                            Use this account for payments by default.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Update Account" : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
