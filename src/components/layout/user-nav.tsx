'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type User } from '@/lib/types';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


import { useUser, useClerk } from '@clerk/nextjs';

export function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName[0] || '') + (lastName[0] || '');
  };

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
  const email = user.primaryEmailAddress?.emailAddress || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto flex items-center gap-3 px-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-slate-900 leading-none">{fullName}</span>
            <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Manager</span>
          </div>
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
