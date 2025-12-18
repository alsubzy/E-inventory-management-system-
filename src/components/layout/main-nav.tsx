'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Truck,
  Box,
  Package,
  BarChart2,
  Wallet,
  MapPin,
  Users,
  BookUser,
  HelpCircle,
  Headset,
  ChevronDown,
  LineChart,
  Settings,
  List,
  ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mainMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/forecasting', label: 'Forecasting', icon: LineChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const supportMenuItems = [
    { href: '#', label: 'User Guide', icon: BookUser },
    { href: '#', label: 'FAQ', icon: HelpCircle },
    { href: '#', label: 'Help Center', icon: Headset },
]

export function MainNav() {
  const pathname = usePathname();
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="p-4 flex flex-col h-full">
      <SidebarMenu>
        {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton isActive={isActive(item.href)} className="justify-start">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
      </SidebarMenu>
      
      <div className="mt-auto">
        <SidebarMenu>
             {supportMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton className="justify-start" variant="ghost">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </div>

    </nav>
  );
}
