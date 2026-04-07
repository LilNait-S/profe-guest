'use client';

import { use } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';

import { usePaymentsByStudent } from '@/services/payments';
import { useStudent } from '@/services/students';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function PaymentHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { data: student } = useStudent(studentId);
  const { data: payments, isLoading } = usePaymentsByStudent(studentId);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="size-10" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...(payments ?? [])].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/payments">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {student?.name ?? 'Alumno'}
          </h1>
          <p className="text-xs text-muted-foreground">Historial de pagos</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Receipt className="size-10" />
          <p className="text-sm">Sin pagos registrados.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="flex flex-col gap-2">
            {sorted.map((p) => {
              const monthLabel = capitalizeFirst(
                format(new Date(p.year, p.month - 1, 1), 'MMMM yyyy', { locale: es }),
              );

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {monthLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      S/ {p.amount.toFixed(2)}
                      {p.payment_method && ` · ${p.payment_method}`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    {p.paid ? (
                      <>
                        <Badge variant="outline" className="text-primary border-primary/30">
                          Pagado
                        </Badge>
                        {p.paid_date && (
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(p.paid_date + 'T12:00:00'), "d MMM yyyy", { locale: es })}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
