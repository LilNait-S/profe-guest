'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePaymentsByMonth, useUpdatePayment } from '@/services/payments';
import { useStudents } from '@/services/students';
import type { Payment } from '@/types';

function PendingRow({ payment, studentName }: { payment: Payment; studentName: string }) {
  const updatePayment = useUpdatePayment(payment.id);

  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-white px-4 py-3">
      <div>
        <Link href={`/payments/${payment.student_id}`} className="font-medium hover:underline">
          {studentName}
        </Link>
        <p className="text-sm text-gray-500">${payment.amount}</p>
      </div>
      <button
        onClick={() => updatePayment.mutate({ paid: true })}
        disabled={updatePayment.isPending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
      >
        Marcar ✓
      </button>
    </div>
  );
}

export default function PaymentsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: payments, isLoading } = usePaymentsByMonth(month, year);
  const { data: students } = useStudents();

  const studentMap = new Map(students?.map((s) => [s.id, s]));

  const pending = payments?.filter((p) => !p.paid) ?? [];
  const completed = payments?.filter((p) => p.paid) ?? [];

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Pagos</h1>

      <div className="mb-6 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 text-gray-600">&larr;</button>
        <span className="font-medium">{monthNames[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-2 text-gray-600">&rarr;</button>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase text-orange-600">
            Pendientes ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((p) => (
              <PendingRow
                key={p.id}
                payment={p}
                studentName={studentMap.get(p.student_id)?.name ?? 'Alumno'}
              />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase text-green-600">
            Pagados ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-green-200 bg-white px-4 py-3">
                <div>
                  <Link href={`/payments/${p.student_id}`} className="font-medium hover:underline">
                    {studentMap.get(p.student_id)?.name ?? 'Alumno'}
                  </Link>
                  <p className="text-sm text-gray-500">${p.amount}</p>
                </div>
                <span className="text-xs text-gray-400">{p.paid_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!payments?.length && (
        <p className="text-center text-gray-500">No hay pagos registrados para este mes.</p>
      )}
    </div>
  );
}
