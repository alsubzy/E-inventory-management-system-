"use client"

import { useEffect, useState } from "react"
import { getSubscriptionPlansDB, getCurrentSubscriptionDB, updateSubscriptionDB } from "@/lib/actions/subscription-db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [currentPlan, setCurrentPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [plansRes, currentRes] = await Promise.all([
                getSubscriptionPlansDB(),
                getCurrentSubscriptionDB()
            ])

            if (plansRes.success) setPlans(plansRes.apiData)
            if (currentRes.success) setCurrentPlan(currentRes.apiData)
            setLoading(false)
        }
        loadData()
    }, [])

    async function handleSelectPlan(planId: string) {
        setUpdating(planId)
        const res = await updateSubscriptionDB(planId)
        if (res.success) {
            // Refresh current plan
            const currentRes = await getCurrentSubscriptionDB()
            if (currentRes.success) setCurrentPlan(currentRes.apiData)
            toast({ title: "Subscription Updated", description: "Your plan has been updated." })
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
        setUpdating(null)
    }

    if (loading) return <div className="p-8">Loading plans...</div>

    return (
        <div className="space-y-8">
            <PageHeader title="Subscription" description="Manage your billing and plan details." />

            {/* Current Plan Info */}
            {currentPlan && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg text-primary">Current Plan: {currentPlan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            You are subscribed to the {currentPlan.name} plan.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">Active</Badge>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = currentPlan?.id === plan.id
                    return (
                        <Card key={plan.id} className={`flex flex-col ${isCurrent ? 'border-primary shadow-md' : ''}`}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/ month</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-2 text-sm">
                                    {plan.features?.split(',').map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature.trim()}
                                        </li>
                                    ))}
                                    {/* Mock features if empty */}
                                    {!plan.features && (
                                        <>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All features included</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority support</li>
                                        </>
                                    )}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isCurrent ? "outline" : "default"}
                                    disabled={isCurrent || updating === plan.id}
                                    onClick={() => handleSelectPlan(plan.id)}
                                >
                                    {updating === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isCurrent ? "Current Plan" : "Upgrade"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {plans.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    No subscription plans available. Please contact admin to seed plans.
                </div>
            )}
        </div>
    )
}
