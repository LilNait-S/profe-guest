'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QueryProvider } from '@/components/providers/query-provider';
import { CalendarDays, Users, Wallet, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: CalendarDays },
  { href: '/students', label: 'Alumnos', icon: Users },
  { href: '/payments', label: 'Pagos', icon: Wallet },
  { href: '/profile', label: 'Perfil', icon: User },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pb-16">{children}</main>

        {/* Bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card"
          aria-label="Navegacion principal"
        >
          <div className="flex justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs transition-colors ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </QueryProvider>
  );
}
