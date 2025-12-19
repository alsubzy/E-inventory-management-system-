import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
                <ShieldAlert className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Unauthorized Access</h1>
            <p className="mb-8 max-w-md text-muted-foreground">
                You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/login">Switch Account</Link>
                </Button>
                <Button asChild className="bg-[#00444F] hover:bg-[#003a44]">
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
