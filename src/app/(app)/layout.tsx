import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';
import { Header } from '@/components/layout/header';
import { Package } from 'lucide-react';
import { mockUser } from '@/lib/data';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">StockPilot</span>
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
