import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { EInventoryLogo } from '@/components/e-inventory-logo';
import { redirect } from 'next/navigation';
import { mockUser } from '@/lib/data';
import { auth } from '@clerk/nextjs/server';
import { getBusinessInfoDB } from '@/lib/actions/settings-db';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect('/login');
  }

  // Fetch business info server-side
  const { data: businessInfo } = await getBusinessInfoDB();

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border bg-white">
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
          <div className="flex h-20 items-center px-6 mb-4">
            <div className="flex items-center gap-2">
              {businessInfo?.logo ? (
                <img src={businessInfo.logo} alt="Logo" className="h-8 w-8 rounded object-contain" />
              ) : (
                <div className="bg-primary p-1.5 rounded-lg">
                  <EInventoryLogo className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold tracking-tight text-primary">
                {businessInfo?.businessName || 'E-Inventory LTD'}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <MainNav />
          </div>
        </div>
      </Sidebar>
      <div className="flex flex-1 flex-col bg-[#F3F4F6]">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <SidebarInset className="bg-transparent border-none shadow-none">{children}</SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
