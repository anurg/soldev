import { Sidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-slate-100/40 lg:block dark:bg-slate-800/40">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-slate-100/40 px-6 lg:h-[60px] dark:bg-slate-800/40">
          <div className="font-bold lg:hidden">TaskTracker</div>
          <div className="ml-auto flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
