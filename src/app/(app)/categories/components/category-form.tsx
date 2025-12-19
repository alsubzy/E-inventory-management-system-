"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCategoryDB, updateCategoryDB } from "@/lib/actions/categories-db"
import { toast } from "@/hooks/use-toast" // Fix import path if needed
import { Loader2 } from "lucide-react"

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
    initialData?: CategoryFormValues & { id: string }
    onSuccess?: () => void
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialData || {
            name: "",
            description: "",
        },
    })

    async function onSubmit(data: CategoryFormValues) {
        setLoading(true)
        try {
            let result
            if (initialData) {
                result = await updateCategoryDB(initialData.id, data)
            } else {
                result = await createCategoryDB(data)
            }

            if (result.success) {
                toast({
                    title: initialData ? "Category updated" : "Category created",
                    description: `Successfully ${initialData ? "updated" : "created"} category.`,
                })
                form.reset()
                onSuccess?.()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to save category",
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Electronics" {...field} />
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
                                <Textarea
                                    placeholder="Category description..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Category" : "Create Category"}
                </Button>
            </form>
        </Form>
    )
}
