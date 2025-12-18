import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { EInventoryLogo } from '@/components/e-inventory-logo';
import { redirect } from 'next/navigation';
import { mockUser } from '@/lib/data';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appUser = mockUser;

  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
             <div className="flex items-center gap-2">
                <EInventoryLogo className="h-8 w-8" />
                <span className="text-xl font-semibold">E-inventory Management system</span>
             </div>
             <Button variant="ghost" size="icon" className="h-8 w-8">
                <PanelLeftClose />
             </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MainNav />
          </div>
        </div>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <Header user={appUser} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
            <SidebarInset>{children}</SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
