'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';

import {
  createScheduleSchema,
  type CreateScheduleInput,
  type CreateScheduleOutput,
  type ScheduleType,
} from '@/lib/schemas/lesson';
import { toDayOfWeek } from '@/lib/calendar-utils';
import { useCreateSchedule } from '@/services/lessons';
import { useCreatePayment } from '@/services/payments';
import { useTeacher } from '@/services/teacher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { AddStudentSheet } from '@/components/calendar/add-student-sheet';
import type { Student } from '@/types';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

/**
 * Given a reference date and selected days of week (0=Mon..6=Sun),
 * finds the nearest start date and calculates a 4-week end date.
 */
/**
 * Given a reference date and selected days of week (0=Mon..6=Sun),
 * calculates a 4-week range anchored to the reference date's week.
 * The earliest selected day in that week is the start, the latest + 3 weeks is the end.
 */
function calculateMonthlyRange(
  referenceDate: Date,
  daysOfWeek: number[],
): { startDate: string; endDate: string } {
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const earliestDay = sorted[0];
  const latestDay = sorted[sorted.length - 1];

  // Find the Monday of the reference date's week
  const refDow = toDayOfWeek(referenceDate);
  const monday = addDays(referenceDate, -refDow);

  // Start = earliest selected day in this week
  const startDate = addDays(monday, earliestDay);
  // End = latest selected day + 3 weeks
  const endDate = addDays(monday, latestDay + 21);

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

interface LessonFormProps {
  date: Date;
  students: Student[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function LessonForm({
  date,
  students,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const { mutate, isPending } = useCreateSchedule();
  const { mutate: createPayment } = useCreatePayment();
  const { data: teacher } = useTeacher();
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const paymentMethods = teacher?.payment_methods ?? [{ name: 'Efectivo', surcharge: 0 }];
  const subjects = teacher?.subjects ?? [];

  const defaultDayOfWeek = toDayOfWeek(date);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
  } = useForm<CreateScheduleInput, unknown, CreateScheduleOutput>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      student_id: '',
      schedule_type: 'monthly',
      days_of_week: [defaultDayOfWeek],
      start_time: '09:00',
      end_time: '10:00',
      date: format(date, 'yyyy-MM-dd'),
      subject: null,
      amount: 0,
      paid: false,
      payment_method: null,
    },
  });

  const scheduleType = watch('schedule_type') as ScheduleType;
  const daysOfWeek = watch('days_of_week') ?? [];
  const studentId = watch('student_id');
  const amount = watch('amount') ?? 0;

  const selectedPaymentMethod = watch('payment_method');
  const selectedStudent = students.find((s) => s.id === studentId);
  const selectedMethod = paymentMethods.find((m) => m.name === selectedPaymentMethod);
  const surcharge = selectedMethod?.surcharge ?? 0;
  const totalAmount = amount + surcharge;

  // Pre-fill amount when student changes
  const lastStudentRef = { current: '' };
  if (selectedStudent && selectedStudent.id !== lastStudentRef.current) {
    lastStudentRef.current = selectedStudent.id;
    if (selectedStudent.monthly_rate > 0 && amount === 0) {
      setValue('amount', selectedStudent.monthly_rate);
    }
  }

  const onSubmit = (data: CreateScheduleOutput) => {
    if (data.schedule_type === 'monthly') {
      const { startDate, endDate } = calculateMonthlyRange(date, data.days_of_week);
      mutate(
        {
          student_id: data.student_id,
          days_of_week: data.days_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          recurring: true,
          start_date: startDate,
          end_date: endDate,
          date: null,
          subject: data.subject,
        },
        {
          onSuccess: () => {
            // Create payment if marked as paid
            if (data.paid && data.amount > 0) {
              const startMonth = new Date(startDate + 'T12:00:00');
              const paymentTotal = data.amount + (selectedMethod?.surcharge ?? 0);
              createPayment(
                {
                  student_id: data.student_id,
                  month: startMonth.getMonth() + 1,
                  year: startMonth.getFullYear(),
                  amount: paymentTotal,
                  payment_method: data.payment_method,
                },
                {
                  onSuccess: () => {
                    toast.success('Clases creadas y pago registrado');
                    onSuccess();
                  },
                  onError: () => {
                    toast.success('Clases creadas (error al registrar pago)');
                    onSuccess();
                  },
                },
              );
            } else {
              toast.success('Clases creadas');
              onSuccess();
            }
          },
          onError: () => {
            toast.error('No se pudo crear las clases');
          },
        },
      );
    } else {
      // Convert selected days of week to actual dates from the clicked week
      const refDow = toDayOfWeek(date);
      const monday = addDays(date, -refDow);
      const selectedDays = data.days_of_week;
      const dates = selectedDays.map((dow) => format(addDays(monday, dow), 'yyyy-MM-dd'));
      const plural = selectedDays.length > 1;

      mutate(
        {
          student_id: data.student_id,
          days_of_week: selectedDays,
          start_time: data.start_time,
          end_time: data.end_time,
          recurring: false,
          dates,
          subject: data.subject,
        },
        {
          onSuccess: () => {
            if (data.paid && data.amount > 0) {
              const firstDate = new Date(dates[0] + 'T12:00:00');
              const paymentTotal = data.amount + (selectedMethod?.surcharge ?? 0);
              createPayment(
                {
                  student_id: data.student_id,
                  month: firstDate.getMonth() + 1,
                  year: firstDate.getFullYear(),
                  amount: paymentTotal,
                  payment_method: data.payment_method,
                },
                {
                  onSuccess: () => {
                    toast.success(plural ? 'Clases creadas y pago registrado' : 'Clase creada y pago registrado');
                    onSuccess();
                  },
                  onError: () => {
                    toast.success(plural ? 'Clases creadas (error al registrar pago)' : 'Clase creada (error al registrar pago)');
                    onSuccess();
                  },
                },
              );
            } else {
              toast.success(plural ? 'Clases creadas' : 'Clase creada');
              onSuccess();
            }
          },
          onError: () => {
            toast.error(plural ? 'No se pudo crear las clases' : 'No se pudo crear la clase');
          },
        },
      );
    }
  };

  // Fixed week dates based on the clicked date (Mon-Sun of that week)
  const weekMonday = addDays(date, -toDayOfWeek(date));
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i).getDate());

  // Preview text for monthly
  const monthlyPreview = (() => {
    if (scheduleType !== 'monthly' || daysOfWeek.length === 0) return null;
    const { startDate, endDate } = calculateMonthlyRange(date, daysOfWeek);
    const start = format(new Date(startDate + 'T12:00:00'), "d 'de' MMM", { locale: es });
    const end = format(new Date(endDate + 'T12:00:00'), "d 'de' MMM", { locale: es });
    return `${start} al ${end} (4 semanas)`;
  })();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Student combobox */}
        <Controller
          name="student_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel>Alumno</FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setAddStudentOpen(true)}
                >
                  <PlusIcon data-icon="inline-start" />
                  Agregar nuevo alumno
                </Button>
              </div>
              <StudentCombobox
                students={students}
                value={field.value}
                onChange={field.onChange}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {/* Subject selector (only if teacher has subjects) */}
        {subjects.length > 0 && (
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Materia</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((sub) => {
                    const isSelected = field.value === sub.name;
                    return (
                      <Button
                        key={sub.name}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={isSelected ? 'text-white' : ''}
                        style={isSelected ? { backgroundColor: sub.color } : undefined}
                        onClick={() => field.onChange(isSelected ? null : sub.name)}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : sub.color }}
                        />
                        {sub.name}
                      </Button>
                    );
                  })}
                </div>
              </Field>
            )}
          />
        )}

        {/* Type toggle: Mensual | Puntual */}
        <Controller
          name="schedule_type"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Tipo de clase</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={field.value === 'monthly' ? 'default' : 'outline'}
                  className="flex-1 h-11"
                  onClick={() => field.onChange('monthly')}
                >
                  Mensual
                </Button>
                <Button
                  type="button"
                  variant={field.value === 'one_off' ? 'default' : 'outline'}
                  className="flex-1 h-11"
                  onClick={() => field.onChange('one_off')}
                >
                  Puntual
                </Button>
              </div>
            </Field>
          )}
        />

        {/* Day selector (both monthly and one-off) */}
        <Controller
          name="days_of_week"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {scheduleType === 'monthly' ? 'Días de la semana' : 'Días de clase'}
              </FieldLabel>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, idx) => {
                  const selected = field.value?.includes(idx) ?? false;
                  return (
                    <Button
                      key={idx}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="icon"
                      className="min-h-[44px] min-w-[44px] flex-1 flex-col gap-0 py-1"
                      onClick={() => {
                        const current = field.value ?? [];
                        const next = selected
                          ? current.filter((d) => d !== idx)
                          : [...current, idx].sort();
                        field.onChange(next);
                      }}
                    >
                      {label}
                      <span className="text-[10px] font-normal opacity-60">
                        {weekDates[idx]}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <FieldError errors={[fieldState.error]} />
              {monthlyPreview && (
                <FieldDescription>{monthlyPreview}</FieldDescription>
              )}
            </Field>
          )}
          />

        {/* Time pickers */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Controller
            name="start_time"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1">
                <FieldLabel htmlFor={field.name}>Inicio</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="time"
                  className="h-11"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="end_time"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1">
                <FieldLabel htmlFor={field.name}>Fin</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="time"
                  className="h-11"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        {/* Payment section */}
        {selectedStudent && (
          <>
            {/* Amount input */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="lesson-amount">Monto (S/)</FieldLabel>
                  <Input
                    id="lesson-amount"
                    type="number"
                    min="0"
                    step="1"
                    className="h-11"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    placeholder="Ej: 210"
                  />
                  {surcharge > 0 && amount > 0 && (
                    <FieldDescription>
                      Total con {selectedMethod?.name}: S/ {totalAmount.toFixed(2)} (+S/{surcharge})
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            {/* Paid switch */}
            <Controller
              name="paid"
              control={control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium text-foreground">¿Pagó?</span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked && !selectedPaymentMethod && paymentMethods.length > 0) {
                          setValue('payment_method', paymentMethods[0].name);
                        }
                      }}
                    />
                  </div>
                </Field>
              )}
            />

            {/* Payment method selector (only when paid=true) */}
            {watch('paid') && paymentMethods.length > 1 && (
              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Medio de pago</FieldLabel>
                    <div className="flex gap-1.5">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.name}
                          type="button"
                          variant={field.value === method.name ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => field.onChange(method.name)}
                        >
                          {method.name}
                          {method.surcharge > 0 && (
                            <span className="ml-1 text-[10px] opacity-70">+{method.surcharge}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </Field>
                )}
              />
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-11" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>

      <AddStudentSheet
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onCreated={(studentId) => {
          setValue('student_id', studentId);
        }}
      />
    </>
  );
}

/* ─── Student Combobox ─── */

interface StudentComboboxProps {
  students: Student[];
  value: string;
  onChange: (value: string) => void;
}

interface StudentOption {
  value: string;
  label: string;
}

function StudentCombobox({ students, value, onChange }: StudentComboboxProps) {
  const [inputValue, setInputValue] = useState('');

  const options: StudentOption[] = students.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox<StudentOption>
      value={selected}
      onValueChange={(val) => {
        if (val != null) onChange(val.value);
      }}
      onInputValueChange={setInputValue}
    >
      <ComboboxInputGroup>
        <ComboboxInput placeholder="Buscar alumno..." />
        <ComboboxTrigger />
      </ComboboxInputGroup>

      <ComboboxPopup>
        <ComboboxList>
          {filtered.map((opt) => (
            <ComboboxItem key={opt.value} value={opt}>
              {opt.label}
            </ComboboxItem>
          ))}
          {filtered.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No se encontraron alumnos
            </div>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
