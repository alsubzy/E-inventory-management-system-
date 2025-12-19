'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isLoaded, signIn } = useSignIn();
    const { userId } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    // Redirect if already signed in
    useEffect(() => {
        if (userId) {
            router.push('/dashboard');
        }
    }, [userId, router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);
        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });

            toast({
                title: 'Reset Code Sent',
                description: "Check your email for the reset code.",
            });
            router.push('/reset-password');
        } catch (err: any) {
            console.error('Error during forgot password:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.errors?.[0]?.longMessage || 'Unable to initiate password reset.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Forgot Password</h1>
                <p className="text-muted-foreground">Enter your email and we'll send you a reset code.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200"
                        required
                    />
                </div>

                <Button type="submit" className="w-full h-12 bg-[#00444F] hover:bg-[#003a44] text-base" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Code
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
