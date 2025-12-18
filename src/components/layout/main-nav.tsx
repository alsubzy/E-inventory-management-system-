'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  LineChart,
  Bot,
  Settings,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Boxes },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/reports', label: 'Reports', icon: LineChart },
  { href: '/forecasting', label: 'Forecasting', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export function MainNav() {
  const pathname = usePathname();
  // In a real app, you'd get the user's role from an auth context
  const userRole = 'Admin';

  return (
    <nav className="p-4">
      <SidebarMenu>
        {menuItems.map((item) => {
          if (item.adminOnly && userRole !== 'Admin') {
            return null;
          }
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton isActive={isActive}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
