import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { Header } from '@/components/layout/header';
import { mockUser } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { DInventyLogo } from '@/components/d-inventy-logo';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
             <div className="flex items-center gap-2">
                <DInventyLogo className="h-8 w-8" />
                <span className="text-xl font-semibold">E-inventory</span>
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
        <Header user={mockUser} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
            <SidebarInset>{children}</SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
