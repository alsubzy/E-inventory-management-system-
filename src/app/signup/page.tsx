'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { EInventoryLogo } from '@/components/e-inventory-logo';

const SignupForm = dynamic(
  () => import('@/components/auth/signup-form').then(mod => mod.SignupForm),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center font-medium text-muted-foreground">
        Preparing signup form...
      </div>
    )
  }
);
export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="max-w-md w-full p-8 md:p-12 bg-white flex flex-col justify-center rounded-xl shadow-2xl">
                <div className="mb-8 flex justify-center">
                    <EInventoryLogo className="h-7" />
                </div>
                <SignupForm />
            </Card>
        </div>
    );
}
