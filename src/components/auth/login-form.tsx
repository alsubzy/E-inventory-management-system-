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
import { Checkbox } from '../ui/checkbox';
import Link from 'next/link';
// import { useSignIn } from '@clerk/nextjs';
// import type { ClerkAPIError } from '@clerk/types';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.85,44,30.344,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
  
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5z"/>
    <path fill="#fff" d="M26.572,29.036h4.917l0.772-5.69h-5.69v-3.74c0-1.584,0.788-3.129,3.129-3.129h2.539v-4.88c-0.448-0.057-1.985-0.19-3.75-0.19c-3.805,0-6.335,2.336-6.335,6.562v5.378h-4.338v5.69h4.338v13.385C24.811,42.883,25.684,43,26.572,43V29.036z"/>
</svg>
);


export function LoginForm() {
  const router = useRouter();
  // const { signIn, setActive, isLoaded } = useSignIn();
  const isLoaded = true; // Mock loaded state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // if (!isLoaded) {
    //   return;
    // }
    setIsLoading(true);
    // Mock successful login for UI development
    setTimeout(() => {
        toast({
            title: 'Login Successful (Mock)',
            description: "Welcome back! You're being redirected.",
        });
        router.push('/dashboard');
        setIsLoading(false);
    }, 1000);
    
    // try {
    //   const result = await signIn.create({
    //     identifier: data.email,
    //     password: data.password,
    //   });

    //   if (result.status === 'complete') {
    //     await setActive({ session: result.createdSessionId });
    //     toast({
    //       title: 'Login Successful',
    //       description: "Welcome back! You're being redirected.",
    //     });
    //     router.push('/dashboard');
    //   } else {
    //     // Handle other statuses like 'needs_first_factor', 'needs_second_factor', etc.
    //     console.log(result);
      // }
    // } catch (err) {
    //   const clerkError = err as { errors: ClerkAPIError[] };
    //   const errorMessage = clerkError.errors?.[0]?.longMessage || 'An unknown error occurred.';
    //   toast({
    //     variant: 'destructive',
    //     title: 'Login Failed',
    //     description: errorMessage,
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sign in to E-inventory Management system</h1>
        <p className="text-muted-foreground">Enter your details below to access your account.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="Enter your password" 
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remember me
                </label>
            </div>
            <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot Password?</Link>
          </div>


          <Button type="submit" className="w-full h-12 bg-[#00444F] hover:bg-[#003a44] text-base" disabled={isLoading || !isLoaded}>
            {(isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
        </Button>
        <Button variant="outline" className="h-12">
            <FacebookIcon className="mr-2 h-5 w-5" />
            Facebook
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="#" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
