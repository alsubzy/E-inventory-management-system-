import { PageHeader } from '@/components/page-header';
import { BusinessInfoForm } from '@/components/settings/business-info-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, UserCog, Settings as SettingsIcon } from 'lucide-react';

export default async function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your business information, profile, and system preferences."
      />

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business Info</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">User Settings</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2" disabled>
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <div className="max-w-4xl">
            <BusinessInfoForm />
          </div>
        </TabsContent>

        <TabsContent value="user" className="mt-6">
          <div className="max-w-2xl">
            <p className="text-muted-foreground">User profile settings coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="max-w-2xl">
            <p className="text-muted-foreground">System settings will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
