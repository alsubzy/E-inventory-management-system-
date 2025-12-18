'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
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
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mainMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/logistics', label: 'Logistics', icon: Truck },
  { href: '/orders', label: 'Orders', icon: Box },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/report', label: 'Report', icon: BarChart2 },
  { href: '/cashflow', label: 'Cashflow', icon: Wallet },
];

const secondaryMenuItems = [
    { href: '/customers', label: 'Customers', icon: Users },
]

const supportMenuItems = [
    { href: '/user-guide', label: 'User Guide', icon: BookUser },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/help-center', label: 'Help Center', icon: Headset },
]

export function MainNav() {
  const pathname = usePathname();
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  return (
    <nav className="p-4 flex flex-col h-full">
      <SidebarMenu>
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton isActive={isActive} className="justify-start">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
        
        <Collapsible open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start">
                    <MapPin className="h-5 w-5" />
                    <span>Tracking</span>
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isTrackingOpen && "rotate-180")} />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-8 pt-1 space-y-1">
                 <Link href="#" passHref legacyBehavior><a className="block text-sm text-muted-foreground hover:text-foreground">Shipment Tracking</a></Link>
                 <Link href="#" passHref legacyBehavior><a className="block text-sm text-muted-foreground hover:text-foreground">Fleet Tracking</a></Link>
            </CollapsibleContent>
        </Collapsible>

         {secondaryMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton isActive={isActive} className="justify-start">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      
      <div className="mt-auto">
        <SidebarMenu>
             {supportMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
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