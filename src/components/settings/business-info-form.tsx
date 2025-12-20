'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getBusinessInfoDB, updateBusinessInfoDB } from '@/lib/actions/settings-db';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, Building2, Globe, Phone, Mail, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/nextjs';
import { checkRole } from '@/lib/auth';

const businessInfoSchema = z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    legalName: z.string().optional(),
    logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    currency: z.string().min(1, 'Currency is required'),
    taxRate: z.coerce.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100'),
    taxId: z.string().optional(),
    invoiceFooter: z.string().optional(),
    socialLinks: z.string().optional(),
});

type BusinessInfoFormValues = z.infer<typeof businessInfoSchema>;

interface BusinessInfoFormProps {
    onSuccess?: () => void;
}

export function BusinessInfoForm({ onSuccess }: BusinessInfoFormProps) {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { user } = useUser();
    const isAdmin = checkRole(user, ['ADMIN', 'MANAGER', 'STAFF']);

    const form = useForm<BusinessInfoFormValues>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: {
            businessName: '',
            legalName: '',
            logo: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            currency: 'USD',
            taxRate: 0,
            taxId: '',
            invoiceFooter: '',
            socialLinks: '',
        },
    });

    useEffect(() => {
        const loadBusinessInfo = async () => {
            setInitialLoading(true);
            const result = await getBusinessInfoDB();
            if (result.success && result.data) {
                form.reset({
                    businessName: result.data.businessName || '',
                    legalName: result.data.legalName || '',
                    logo: result.data.logo || '',
                    address: result.data.address || '',
                    phone: result.data.phone || '',
                    email: result.data.email || '',
                    website: result.data.website || '',
                    currency: result.data.currency || 'USD',
                    taxRate: result.data.taxRate || 0,
                    taxId: result.data.taxId || '',
                    invoiceFooter: result.data.invoiceFooter || '',
                    socialLinks: result.data.socialLinks || '',
                });
            }
            setInitialLoading(false);
        };

        loadBusinessInfo();
    }, [form]);

    async function onSubmit(data: BusinessInfoFormValues) {
        if (!isAdmin) {
            toast({
                title: 'Access Denied',
                description: 'You do not have permission to update business information',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const result = await updateBusinessInfoDB(data);

            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Business information updated successfully',
                });
                onSuccess?.();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to update business information',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Core business details displayed across the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E-Inventory LTD" {...field} disabled={!isAdmin} />
                                    </FormControl>
                                    <FormDescription>
                                        Displayed in sidebar, invoices, and reports
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="legalName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Legal Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E-Inventory Limited" {...field} disabled={!isAdmin} />
                                    </FormControl>
                                    <FormDescription>
                                        Official legal business name (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://example.com/logo.png"
                                                {...field}
                                                disabled={!isAdmin}
                                            />
                                            {field.value && (
                                                <img
                                                    src={field.value}
                                                    alt="Logo preview"
                                                    className="h-10 w-10 rounded object-contain border"
                                                />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Logo displayed in sidebar and invoices
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                        <CardDescription>
                            Contact details for invoices and customer communication
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="123 Business Street, Tech City, TC 12345"
                                            {...field}
                                            disabled={!isAdmin}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 123-4567" {...field} disabled={!isAdmin} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@business.com" {...field} disabled={!isAdmin} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://www.business.com" {...field} disabled={!isAdmin} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Financial Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Financial Settings
                        </CardTitle>
                        <CardDescription>
                            Currency, tax, and financial configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="USD" {...field} disabled={!isAdmin} />
                                        </FormControl>
                                        <FormDescription>
                                            System-wide currency code
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Tax Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0" {...field} disabled={!isAdmin} />
                                        </FormControl>
                                        <FormDescription>
                                            Used in POS and invoices
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tax ID / VAT Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="TAX-123456789" {...field} disabled={!isAdmin} />
                                    </FormControl>
                                    <FormDescription>
                                        Displayed on invoices and receipts
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Invoice Customization Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice Customization
                        </CardTitle>
                        <CardDescription>
                            Custom messages and branding for invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="invoiceFooter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Invoice Footer</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Thank you for your business! For inquiries, please contact us."
                                            {...field}
                                            disabled={!isAdmin}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Custom footer text for invoices and receipts
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="socialLinks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Social Links (JSON)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{"facebook": "url", "twitter": "url"}'
                                            {...field}
                                            disabled={!isAdmin}
                                            rows={2}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        JSON format for social media links
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-between">
                    {!isAdmin && (
                        <p className="text-sm text-muted-foreground">
                            You do not have permission to edit business information
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={loading || !isAdmin}
                        className="ml-auto"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
