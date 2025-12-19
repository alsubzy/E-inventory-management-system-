'use client';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Card } from '@/components/ui/card';
import { EInventoryLogo } from '@/components/e-inventory-logo';

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="max-w-md w-full p-8 md:p-12 bg-white flex flex-col justify-center rounded-xl shadow-2xl">
                <div className="mb-8 flex justify-center">
                    <EInventoryLogo className="h-7" />
                </div>
                <ResetPasswordForm />
            </Card>
        </div>
    );
}
