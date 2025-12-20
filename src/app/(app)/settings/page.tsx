import { PageHeader } from '@/components/page-header';
import { SettingsForm } from './components/settings-form';
import { getSettingsDB } from '@/lib/actions/settings-db';

export default async function SettingsPage() {
  const { apiData: settings } = await getSettingsDB();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your business profile and preferences."
      />
      <div className="max-w-2xl">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  );
}
