'use client';

import { use } from 'react';
import { usePaymentsByStudent } from '@/services/payments';
import { useStudent } from '@/services/students';

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
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
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
                <span
                  className={`text-xs ${p.paid ? 'text-green-600' : 'text-orange-600'}`}
                >
                  {p.paid ? '✓ Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
