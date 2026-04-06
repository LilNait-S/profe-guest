'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { QueryProvider } from '@/components/providers/query-provider';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: '\u{1F4C5}' },
  { href: '/students', label: 'Alumnos', icon: '\u{1F465}' },
  { href: '/payments', label: 'Pagos', icon: '\u{1F4B0}' },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            ProfeGest
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Salir
            </Button>
          </div>
        </header>

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
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs transition-colors ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.icon}
                  </span>
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
