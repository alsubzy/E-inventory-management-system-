import dynamic from 'next/dynamic';
const SignupForm = dynamic(() => import('@/components/auth/signup-form').then(mod => mod.SignupForm), { ssr: false });

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <SignupForm />
        </div>
    );
}
