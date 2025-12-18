'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { type User } from '@/lib/types';
import { Input } from '../ui/input';
import { Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background px-4 md:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
       <h1 className="text-2xl font-semibold hidden md:block">Dashboard</h1>
      <div className="flex w-full items-center justify-end gap-4">
        <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search anything..." className="pl-10 h-12 rounded-full bg-card border-none shadow-sm" />
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-full h-12 w-12 bg-card border-none shadow-sm">
            <Bell className="h-6 w-6" />
            <span className="absolute top-3 right-3 block h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        <UserNav user={user} />
      </div>
    </header>
  );
}
