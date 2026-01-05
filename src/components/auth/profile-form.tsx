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
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfileFormSchema = z.object({
    firstName: z.string().min(2, { message: 'First name is required.' }),
    lastName: z.string().min(2, { message: 'Last name is required.' }),
});

export function ProfileForm() {
    const { user, isLoaded } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ProfileFormSchema>>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    useEffect(() => {
        if (isLoaded && user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
        }
    }, [isLoaded, user, form]);

    async function onSubmit(data: z.infer<typeof ProfileFormSchema>) {
        if (!isLoaded || !user) return;

        setIsLoading(true);
        try {
            await user.update({
                firstName: data.firstName,
                lastName: data.lastName,
            });

            toast({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully.',
            });
        } catch (err: any) {
            console.error('Error updating profile:', err);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: err.errors?.[0]?.longMessage || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!isLoaded || !user) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const getInitials = () => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return (firstName[0] || '') + (lastName[0] || '');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-bold">{user.fullName || user.username}</h2>
                    <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="First Name" {...field} className="bg-white" />
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
                                        <Input placeholder="Last Name" {...field} className="bg-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="bg-[#00444F] hover:bg-[#003a44]">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
