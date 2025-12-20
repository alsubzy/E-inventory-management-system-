'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  ChevronDown, // Added for collapsible indicator
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useClerk } from '@clerk/nextjs';
import { checkRole, UserRole } from '@/lib/auth';

// Define the menu structure types
interface SubMenuItem {
  href: string;
  label: string;
  roles?: UserRole[];
}

interface MenuItem {
  href?: string; // Optional for group headers
  label: string;
  icon: any;
  roles?: UserRole[];
  items?: SubMenuItem[]; // Submenu items
}

const mainMenuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Products',
    icon: Package,
    items: [
      { href: '/products', label: 'Products' },
      { href: '/categories', label: 'Categories' },
    ]
  },
  {
    label: 'Parties',
    icon: Users,
    items: [
      { href: '/parties', label: 'Customers' }, // Using general parties page for now
      { href: '/parties', label: 'Suppliers' },
    ]
  },
  { href: '/sales', label: 'Sales', icon: ShoppingBag },
  { href: '/pos', label: 'POS', icon: Monitor },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { href: '/stock-transfers', label: 'Stock Transfer', icon: ArrowRightLeft },
  { href: '/accounts', label: 'Cash & Bank', icon: Landmark },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  {
    label: 'Reports',
    icon: BarChart2,
    items: [
      { href: '/sales-reports', label: 'Sales' },
      { href: '/reports', label: 'Stock' },
      { href: '/reports', label: 'Purchases' }, // Placeholder
      { href: '/reports', label: 'Profit & Loss' },
    ]
  },
  { href: '/staff-members', label: 'Staff & Roles', icon: UserCheck },
  { href: '/online-orders', label: 'Online Orders', icon: Globe },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
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

  const isActive = (href?: string, items?: SubMenuItem[]) => {
    if (href === '/dashboard' || href === '/') {
      return pathname === '/dashboard' || pathname === '/';
    }
    // Check if parent is active (exact match)
    if (href && pathname.startsWith(href)) return true;

    // Check if any child is active
    if (items) {
      return items.some(item => pathname.startsWith(item.href));
    }
    return false;
  };

  const isExactActive = (href: string) => {
    // For submenu items, we generally want exact match or deep prefix if distinct
    // But since some share /parties, we might just check prefix
    return pathname.startsWith(href);
  }

  return (
    <nav className="p-2 flex flex-col h-full">
      <SidebarMenu className="gap-2">
        {mainMenuItems.map((item, index) => {
          // Check role access
          if (item.roles && !checkRole(user, item.roles)) return null;

          // Render Group with Submenu
          if (item.items) {
            const isGroupActive = isActive(undefined, item.items);
            return (
              <Collapsible key={index} defaultOpen={isGroupActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={cn(
                        "w-full justify-between",
                        (isGroupActive && !item.href) ? "font-semibold text-primary" : ""
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        // Check role access for subitems if needed (none specified in plan, but good practice)
                        (!subItem.roles || checkRole(user, subItem.roles)) && (
                          <SidebarMenuItem key={subItem.label}>
                            <SidebarMenuSubButton asChild isActive={isExactActive(subItem.href) && subItem.label === 'Categories' ? pathname.includes('categories') : isExactActive(subItem.href)}>
                              <Link href={subItem.href}>
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuItem>
                        )
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // Render Single Item
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
                className={cn(
                  isActive(item.href) && "font-semibold bg-primary/5 text-primary"
                )}
              >
                <Link href={item.href || '#'}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
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

