'use client';

import { PartyForm } from '../../components/party-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageManager } from '@/lib/local-storage';
import { useEffect, useState, use } from 'react';
import { Party } from '@/lib/types';

export default function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [party, setParty] = useState<Party | null>(null);

    useEffect(() => {
        const parties = storageManager.getParties();
        const found = parties.find(p => p.id === id);
        if (found) setParty(found);
    }, [id]);

    if (!party) return <div className="p-8 text-center text-slate-500">Loading party...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Party</h1>
                <p className="text-sm text-slate-500">Update party details for {party.name}</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Party Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <PartyForm initialData={party} />
                </CardContent>
            </Card>
        </div>
    );
}
