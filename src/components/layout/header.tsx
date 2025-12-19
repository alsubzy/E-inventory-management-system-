'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { type User } from '@/lib/types';
import { Input } from '../ui/input';
import { Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 bg-[#F8F9FA] px-4 md:px-8 border-none">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search inventory, orders, suppliers..."
            className="pl-11 h-11 w-full rounded-xl bg-white border-none shadow-sm text-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10 hover:bg-white hover:shadow-sm transition-all">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </Button>
        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
        <UserNav />
      </div>
    </header>
  );
}
