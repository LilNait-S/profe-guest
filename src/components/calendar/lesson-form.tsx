'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

import { createLessonSchema } from '@/lib/schemas/lesson';
import { toDayOfWeek } from '@/lib/calendar-utils';
import { useCreateLesson } from '@/services/lessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Student } from '@/types';
import type { z } from 'zod';

type LessonFormValues = z.input<typeof createLessonSchema>;
type LessonFormOutput = z.output<typeof createLessonSchema>;

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
  const { mutate, isPending } = useCreateLesson();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<LessonFormValues, unknown, LessonFormOutput>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      student_id: '',
      start_time: '09:00',
      end_time: '10:00',
      recurring: true,
    },
  });

  const recurring = watch('recurring');

  const onSubmit = (data: LessonFormOutput) => {
    const dayOfWeek = toDayOfWeek(date);
    mutate(
      {
        student_id: data.student_id,
        day_of_week: dayOfWeek,
        start_time: data.start_time,
        end_time: data.end_time,
        recurring: data.recurring,
        date: data.recurring ? undefined : format(date, 'yyyy-MM-dd'),
      },
      {
        onSuccess: () => {
          toast.success('Clase creada');
          onSuccess();
        },
        onError: () => {
          toast.error('No se pudo crear la clase');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Student select */}
      <div className="flex flex-col gap-1.5">
        <Label>Alumno</Label>
        <Controller
          control={control}
          name="student_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Selecciona un alumno" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.student_id && (
          <p className="text-sm text-destructive">
            {errors.student_id.message}
          </p>
        )}
      </div>

      {/* Time inputs */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Inicio</Label>
          <Input
            type="time"
            className="h-11"
            {...register('start_time')}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Fin</Label>
          <Input
            type="time"
            className="h-11"
            {...register('end_time')}
          />
        </div>
      </div>
      {errors.end_time && (
        <p className="text-sm text-destructive">{errors.end_time.message}</p>
      )}

      {/* Recurring checkbox */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('recurring')}
            className="h-4 w-4 rounded border-input"
          />
          Se repite cada semana
        </label>
        {!recurring && (
          <p className="text-xs text-muted-foreground">
            Clase puntual para el{' '}
            {format(date, "d 'de' MMMM", { locale: es })}
          </p>
        )}
      </div>

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
  );
}
