'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePaymentsByMonth, useUpdatePayment } from '@/services/payments';
import { useStudents } from '@/services/students';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Payment } from '@/types';

function PendingRow({ payment, studentName }: { payment: Payment; studentName: string }) {
  const updatePayment = useUpdatePayment(payment.id);

  return (
    <Card size="sm" className="border-orange-200">
      <CardContent className="flex items-center justify-between">
        <div>
          <Link href={`/payments/${payment.student_id}`} className="font-medium hover:underline">
            {studentName}
          </Link>
          <p className="text-sm text-gray-500">${payment.amount}</p>
        </div>
        <Button
          size="sm"
          onClick={() => updatePayment.mutate({ paid: true })}
          disabled={updatePayment.isPending}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Marcar ✓
        </Button>
      </CardContent>
    </Card>
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
        <Button variant="ghost" size="icon" onClick={prevMonth}>&larr;</Button>
        <span className="font-medium">{monthNames[month - 1]} {year}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth}>&rarr;</Button>
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
              <Card key={p.id} size="sm" className="border-green-200">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <Link href={`/payments/${p.student_id}`} className="font-medium hover:underline">
                      {studentMap.get(p.student_id)?.name ?? 'Alumno'}
                    </Link>
                    <p className="text-sm text-gray-500">${p.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Pagado
                    </Badge>
                    <span className="text-xs text-gray-400">{p.paid_date}</span>
                  </div>
                </CardContent>
              </Card>
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
