'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  BarChart2,
  Users,
  BookUser,
  HelpCircle,
  Headset,
  Settings,
  ArrowRightLeft,
  ShoppingBag,
  ShoppingCart,
  Monitor,
  Landmark,
  Receipt,
  UserCheck,
  Globe,
  CreditCard,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useClerk } from '@clerk/nextjs';
import { checkRole, UserRole } from '@/lib/auth';

const mainMenuItems: { href: string; label: string; icon: any; roles?: UserRole[]; hasSubmenu?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/parties', label: 'Parties', icon: Users, hasSubmenu: true },
  { href: '/products', label: 'Product Manager', icon: Package, hasSubmenu: true },
  { href: '/sales', label: 'Sales', icon: ShoppingBag, hasSubmenu: true },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart, hasSubmenu: true },
  { href: '/stock-transfer', label: 'Stock Transfer', icon: ArrowRightLeft, hasSubmenu: true },
  { href: '/pos', label: 'POS', icon: Monitor, hasSubmenu: true },
  { href: '/cash-bank', label: 'Cash & Bank', icon: Landmark, hasSubmenu: true },
  { href: '/expenses', label: 'Expenses', icon: Receipt, hasSubmenu: true },
  { href: '/staff-members', label: 'Staff Members', icon: UserCheck, hasSubmenu: true },
  { href: '/sales-reports', label: 'Sales Reports', icon: BarChart2, hasSubmenu: true },
  { href: '/online-orders', label: 'Online Orders', icon: Globe, hasSubmenu: true },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'], hasSubmenu: true },
  { href: '/subscription', label: 'Subscription', icon: CreditCard, hasSubmenu: true },
];

const supportMenuItems = [
  { href: '#', label: 'User Guide', icon: BookUser },
  { href: '#', label: 'FAQ', icon: HelpCircle },
  { href: '#', label: 'Help Center', icon: Headset },
]

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const filteredItems = mainMenuItems.filter(item => {
    if (!item.roles) return true;
    return checkRole(user, item.roles);
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="p-2 flex flex-col h-full">
      <SidebarMenu className="gap-2">
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                isActive={isActive(item.href)}
                className={cn(
                  "justify-start h-11 px-4 rounded-xl transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "text-[#64748B] hover:text-primary hover:bg-[#F3F8F8]"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-white" : "text-[#64748B]")} />
                <span className="flex-1 text-sm font-semibold ml-3">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <div className="mt-auto pt-4 border-t border-white/5">
        <SidebarMenu className="gap-1">
          {supportMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref>
                <SidebarMenuButton className="justify-start h-10 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                  <item.icon className="h-[18px] w-[18px]" />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="justify-start h-10 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="flex-1 text-sm font-medium">Logout</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </nav>
  );
}
