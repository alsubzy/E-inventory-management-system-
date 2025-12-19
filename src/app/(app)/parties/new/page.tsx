'use client';

import { PartyForm } from '../components/party-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewPartyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Add New Party</h1>
                <p className="text-sm text-slate-500">Create a new supplier or customer record</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Party Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <PartyForm />
                </CardContent>
            </Card>
        </div>
    );
}
