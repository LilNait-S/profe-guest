'use client';

import { use } from 'react';
import { usePaymentsByStudent } from '@/services/payments';
import { useStudent } from '@/services/students';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

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
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const sorted = [...(payments ?? [])].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">
        {student?.name ?? 'Alumno'}
      </h1>
      <h2 className="mb-4 text-sm text-gray-500">Historial de pagos</h2>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-500">Sin pagos registrados.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((p) => (
            <Card key={p.id} size="sm">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {MONTH_NAMES[p.month]} {p.year}
                  </p>
                  {p.paid && p.paid_date && (
                    <p className="text-xs text-gray-400">
                      Pagó: {p.paid_date}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${p.amount}</p>
                  <Badge
                    className={
                      p.paid
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                    }
                  >
                    {p.paid ? '✓ Pagado' : 'Pendiente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
