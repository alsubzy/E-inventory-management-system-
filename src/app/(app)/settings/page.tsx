import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your application settings. (Admin Only)"
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive alerts and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
            <Input
              id="low-stock-threshold"
              type="number"
              defaultValue="10"
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Get notified when product quantity falls below this value.
            </p>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Email Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Receive an email when stock is low.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
