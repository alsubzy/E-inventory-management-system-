'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function ResetPasswordForm() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { isLoaded, signIn, setActive } = useSignIn();
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

        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: "Passwords don't match.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                toast({
                    title: 'Password Reset',
                    description: "Your password has been reset successfully.",
                });
                router.push('/dashboard');
            } else {
                console.error(result);
                toast({
                    variant: 'destructive',
                    title: 'Reset Failed',
                    description: "An unexpected error occurred.",
                });
            }
        } catch (err: any) {
            console.error('Error during password reset:', err);
            toast({
                variant: 'destructive',
                title: 'Reset Failed',
                description: err.errors?.[0]?.longMessage || 'Invalid code or password.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground">Enter the code from your email and your new password.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <FormLabel>Reset Code</FormLabel>
                    <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 bg-gray-50 border-gray-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200"
                        required
                    />
                </div>

                <Button type="submit" className="w-full h-12 bg-[#00444F] hover:bg-[#003a44] text-base" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>
            </form>
        </div>
    );
}
