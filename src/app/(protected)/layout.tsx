'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QueryProvider } from '@/components/providers/query-provider';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: '📅' },
  { href: '/students', label: 'Alumnos', icon: '👥' },
  { href: '/payments', label: 'Pagos', icon: '💰' },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-16">{children}</main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
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
                  className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                    isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
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
