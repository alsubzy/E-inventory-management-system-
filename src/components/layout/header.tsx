import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { type User } from '@/lib/types';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {/* Potentially add a global search bar here in the future */}
        <UserNav user={user} />
      </div>
    </header>
  );
}
