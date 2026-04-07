'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Wallet, CircleCheck, CircleAlert, Users } from 'lucide-react';

import { usePaymentsByMonth } from '@/services/payments';
import { useStudents } from '@/services/students';
import { useLessons } from '@/services/lessons';
import { isLessonActiveOnDate } from '@/lib/calendar-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Payment, Student } from '@/types';

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface StudentPaymentRow {
  student: Student;
  payment: Payment | null;
  amount: number;
  paid: boolean;
}

export default function PaymentsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: payments = [], isLoading: loadingPayments } = usePaymentsByMonth(month, year);
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: lessons = [] } = useLessons();

  const monthLabel = capitalizeFirst(
    format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es }),
  );

  // Build the unified list: students with payments + students with active lessons but no payment
  const rows: StudentPaymentRow[] = useMemo(() => {
    const paymentMap = new Map<string, Payment>();
    for (const p of payments) {
      paymentMap.set(p.student_id, p);
    }

    // Find students with active lessons this month
    const studentsWithLessons = new Set<string>();
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    for (const lesson of lessons) {
      if (lesson.recurring && isLessonActiveOnDate(lesson, firstDay)) {
        studentsWithLessons.add(lesson.student_id);
      } else if (!lesson.recurring && lesson.date && lesson.date >= firstDay && lesson.date <= lastDay) {
        studentsWithLessons.add(lesson.student_id);
      }
    }

    const result: StudentPaymentRow[] = [];
    const seen = new Set<string>();

    // Students with payments first
    for (const p of payments) {
      const student = students.find((s) => s.id === p.student_id);
      if (!student) continue;
      seen.add(student.id);
      result.push({
        student,
        payment: p,
        amount: p.amount,
        paid: p.paid,
      });
    }

    // Students with active lessons but no payment = pendiente
    for (const studentId of studentsWithLessons) {
      if (seen.has(studentId)) continue;
      const student = students.find((s) => s.id === studentId);
      if (!student) continue;
      result.push({
        student,
        payment: null,
        amount: student.monthly_rate,
        paid: false,
      });
    }

    // Sort: pendientes first, then by name
    return result.sort((a, b) => {
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      return a.student.name.localeCompare(b.student.name);
    });
  }, [payments, students, lessons, month, year]);

  const totalCobrado = rows.filter((r) => r.paid).reduce((sum, r) => sum + r.amount, 0);
  const totalPendiente = rows.filter((r) => !r.paid).reduce((sum, r) => sum + r.amount, 0);
  const alumnosPagados = rows.filter((r) => r.paid).length;
  const alumnosTotal = rows.length;

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  if (loadingPayments || loadingStudents) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          aria-label="Mes anterior"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">{monthLabel}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <CircleCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
            S/{totalCobrado.toFixed(0)}
          </span>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">Cobrado</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
          <CircleAlert className="size-5 text-amber-600 dark:text-amber-400" />
          <span className="text-base font-bold text-amber-700 dark:text-amber-300">
            S/{totalPendiente.toFixed(0)}
          </span>
          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Pendiente</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/50 p-3">
          <Users className="size-5 text-muted-foreground" />
          <span className="text-base font-bold text-foreground">
            {alumnosPagados}/{alumnosTotal}
          </span>
          <span className="text-[10px] text-muted-foreground">Alumnos</span>
        </div>
      </div>

      {/* Student list */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Wallet className="size-10" />
          <p className="text-sm">Sin pagos ni clases este mes.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <Link
                key={row.student.id}
                href={`/payments/${row.student.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                {/* Avatar */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {row.student.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="text-sm font-medium text-foreground">
                    {row.student.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    S/ {row.amount.toFixed(2)}
                    {row.payment?.payment_method && ` · ${row.payment.payment_method}`}
                  </span>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-0.5">
                  {row.paid ? (
                    <>
                      <Badge variant="outline" className="text-primary border-primary/30">
                        Pagado
                      </Badge>
                      {row.payment?.paid_date && (
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(row.payment.paid_date + 'T12:00:00'), "d MMM", { locale: es })}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      Pendiente
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
