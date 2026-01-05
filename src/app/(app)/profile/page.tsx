import { PageHeader } from '@/components/page-header';
import { ProfileForm } from '@/components/auth/profile-form';

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="My Profile"
                description="Manage your account settings and preferences."
            />
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <ProfileForm />
            </div>
        </div>
    );
}
