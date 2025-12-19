'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSignUp } from '@clerk/nextjs';

const FormSchema = z.object({
    firstName: z.string().min(2, { message: 'First name is required.' }),
    lastName: z.string().min(2, { message: 'Last name is required.' }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
    }),
    confirmPassword: z.string().min(1, {
        message: 'Please confirm your password.',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function SignupForm() {
    const router = useRouter();
    const { isLoaded, signUp, setActive } = useSignUp();
    const { userId } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const { toast } = useToast();

    // Redirect if already signed in
    useEffect(() => {
        if (userId) {
            router.push('/dashboard');
        }
    }, [userId, router]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!isLoaded) return;

        setIsLoading(true);
        try {
            await signUp.create({
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.email,
                password: data.password,
            });

            // Send the verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
            toast({
                title: 'Verification Code Sent',
                description: "Please check your email for the verification code.",
            });
        } catch (err: any) {
            console.error('Error during sign up:', err);
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: err.errors?.[0]?.longMessage || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onVerify(e: React.FormEvent) {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                toast({
                    title: 'Account Created',
                    description: "Welcome to the E-inventory Management system!",
                });
                router.push('/dashboard');
            } else {
                console.error(completeSignUp);
                toast({
                    variant: 'destructive',
                    title: 'Verification Failed',
                    description: "Please check the code and try again.",
                });
            }
        } catch (err: any) {
            console.error('Error during verification:', err);
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: err.errors?.[0]?.longMessage || 'Invalid verification code.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (pendingVerification) {
        return (
            <div className="flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Verify your email</h1>
                    <p className="text-muted-foreground">Enter the verification code sent to your email.</p>
                </div>
                <form onSubmit={onVerify} className="space-y-4">
                    <div className="space-y-2">
                        <FormLabel>Verification Code</FormLabel>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="h-12 bg-gray-50 border-gray-200"
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-[#00444F] hover:bg-[#003a44] text-base" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify Email
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="text-muted-foreground">Enter your details below to get started.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="First Name" {...field} className="h-12 bg-gray-50 border-gray-200" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Last Name" {...field} className="h-12 bg-gray-50 border-gray-200" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} className="h-12 bg-gray-50 border-gray-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            {...field}
                                            className="h-12 bg-gray-50 border-gray-200"
                                        />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Confirm your password"
                                        {...field}
                                        className="h-12 bg-gray-50 border-gray-200"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full h-12 bg-[#00444F] hover:bg-[#003a44] text-base" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
