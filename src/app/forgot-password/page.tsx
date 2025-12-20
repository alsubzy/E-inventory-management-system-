'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { EInventoryLogo } from '@/components/e-inventory-logo';

const ForgotPasswordForm = dynamic(
  () => import('@/components/auth/forgot-password-form').then(mod => mod.ForgotPasswordForm),
  {
    loading: () => (
      <div className="h-[200px] flex items-center justify-center font-medium text-muted-foreground">
        Preparing...
      </div>
    )
  }
);

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="max-w-md w-full p-8 md:p-12 bg-white flex flex-col justify-center rounded-xl shadow-2xl">
                <div className="mb-8 flex justify-center">
                    <EInventoryLogo className="h-7" />
                </div>
                <ForgotPasswordForm />
            </Card>
        </div>
    );
}
