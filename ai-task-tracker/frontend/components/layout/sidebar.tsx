'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut } from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'My Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Teams',
    href: '/teams',
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-50">TaskTracker</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-slate-900 dark:hover:text-slate-50",
                pathname === item.href
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
            <span className="text-xs font-medium">{user?.full_name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
            <span className="text-xs text-slate-500 truncate w-32">{user?.email}</span>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
