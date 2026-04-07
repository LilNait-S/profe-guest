'use client';

import { useState, useMemo, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, CalendarX, RotateCcw, MoreVertical, CalendarOff, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { useDeleteLesson, useUpdateLesson, useCreateSchedule, useCreateException, useDeleteException } from '@/services/lessons';
import { toDayOfWeek, getLessonsForDay } from '@/lib/calendar-utils';
import { getSubjectColor } from '@/lib/subject-colors';
import { useTeacher } from '@/services/teacher';
import { LessonForm } from '@/components/calendar/lesson-form';
import type { Lesson, LessonException, LessonForDay, Payment, Student } from '@/types';

// ---------------------------------------------------------------------------
// Subject badge with color
// ---------------------------------------------------------------------------

function SubjectBadge({ subject }: { subject: string | null }) {
  const { data: teacher } = useTeacher();
  if (!subject) return null;
  const color = getSubjectColor(subject, teacher?.subjects ?? []);
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0"
      style={color ? { borderColor: `${color}50`, color } : undefined}
    >
      {color && <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {subject}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DaySheetProps {
  date: Date | null;
  lessons: Lesson[];
  exceptions: LessonException[];
  students: Student[];
  payments: Payment[];
  /** When true, shows only the creation form without the lesson list */
  formOnly?: boolean;
  onClose: () => void;
  onLessonCreated: () => void;
  onLessonDeleted: () => void;
}

// ---------------------------------------------------------------------------
// Lesson action menu (works for both recurring and one-off)
// ---------------------------------------------------------------------------

function LessonActionMenu({
  lesson,
  date,
  onEdit,
  onDeleted,
}: {
  lesson: LessonForDay;
  date: Date;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const deleteLesson = useDeleteLesson(lesson.id);
  const createException = useCreateException();

  const handleCancel = () => {
    createException.mutate(
      {
        lesson_id: lesson.id,
        exception_date: format(date, 'yyyy-MM-dd'),
        type: 'cancelled',
      },
      {
        onSuccess: () => toast.success('Clase cancelada para este día'),
        onError: () => toast.error('No se pudo cancelar la clase'),
      },
    );
  };

  const handleDelete = () => {
    const msg = lesson.recurring
      ? '¿Eliminar este horario por completo? Se borrará de todas las semanas.'
      : '¿Eliminar esta clase?';
    if (!confirm(msg)) return;

    deleteLesson.mutate(undefined, {
      onSuccess: () => {
        toast.success('Clase eliminada');
        onDeleted();
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Opciones de clase"
          />
        }
      >
        <MoreVertical className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Editar
        </DropdownMenuItem>
        {lesson.recurring && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCancel}>
              <CalendarOff />
              Cancelar esta clase
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 />
          {lesson.recurring ? 'Eliminar horario completo' : 'Eliminar clase'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Restore button (delete exception)
// ---------------------------------------------------------------------------

function RestoreLessonButton({ exceptionId }: { exceptionId: string }) {
  const { mutate, isPending } = useDeleteException(exceptionId);

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isPending}
      onClick={() =>
        mutate(undefined, {
          onSuccess: () => toast.success('Clase restaurada'),
          onError: () => toast.error('No se pudo restaurar la clase'),
        })
      }
    >
      <RotateCcw className="size-3.5" data-icon="inline-start" />
      Restaurar
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Edit lesson inline form
// ---------------------------------------------------------------------------

interface StudentOption {
  value: string;
  label: string;
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

function EditLessonForm({
  lesson,
  editDate,
  allLessons,
  students,
  scope,
  onSuccess,
  onCancel,
}: {
  lesson: Lesson;
  editDate: Date;
  allLessons: Lesson[];
  students: Student[];
  scope: 'this' | 'all';
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson(lesson.id);
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const createException = useCreateException();
  const [comboboxInput, setComboboxInput] = useState('');
  const [collisionError, setCollisionError] = useState<string | null>(null);
  const isPending = isUpdating || isCreating;

  const siblingIds = lesson.schedule_group_id
    ? allLessons.filter((l) => l.schedule_group_id === lesson.schedule_group_id && l.id !== lesson.id).map((l) => l.id)
    : [];

  // When editing "solo esta clase" on a recurring, we're creating a one-off replacement
  const isOneOffEdit = scope === 'this' && lesson.recurring;
  const editDateStr = format(editDate, 'yyyy-MM-dd');

  const { data: teacher } = useTeacher();
  const teacherSubjects = teacher?.subjects ?? [];

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      student_id: lesson.student_id,
      day_of_week: lesson.day_of_week,
      start_time: lesson.start_time.slice(0, 5),
      end_time: lesson.end_time.slice(0, 5),
      recurring: isOneOffEdit ? false : lesson.recurring,
      date: isOneOffEdit ? editDateStr : lesson.date,
      subject: lesson.subject ?? null as string | null,
    },
  });

  const recurring = watch('recurring');

  const options: StudentOption[] = students.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(comboboxInput.toLowerCase()),
  );

  const checkCollision = (studentId: string, dayOfWeek: number, startTime: string, endTime: string): string | null => {
    const conflicting = allLessons.find((l) => {
      if (l.id === lesson.id) return false;
      if (l.student_id !== studentId) return false;
      if (l.day_of_week !== dayOfWeek) return false;
      if (!l.recurring && l.date !== lesson.date) return false;
      // Time overlap check
      const lStart = l.start_time.slice(0, 5);
      const lEnd = l.end_time.slice(0, 5);
      return startTime < lEnd && endTime > lStart;
    });
    if (!conflicting) return null;
    const studentName = students.find((s) => s.id === studentId)?.name ?? 'El alumno';
    return `${studentName} ya tiene clase ese día de ${conflicting.start_time.slice(0, 5)} a ${conflicting.end_time.slice(0, 5)}`;
  };

  const onSubmit = (data: {
    student_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    recurring: boolean;
    date: string | null;
    subject: string | null;
  }) => {
    // Derive day_of_week from date for one-off lessons
    const effectiveDow = !data.recurring && data.date
      ? toDayOfWeek(new Date(data.date + 'T12:00:00'))
      : data.day_of_week;

    // Validate no collision
    const collision = checkCollision(data.student_id, effectiveDow, data.start_time, data.end_time);
    if (collision) {
      setCollisionError(collision);
      return;
    }
    setCollisionError(null);

    if (scope === 'this' && lesson.recurring) {
      // "Solo esta clase" on a recurring lesson:
      // 1. Cancel the original on this date
      // 2. Create a new one-off lesson with the edited data
      const originalDate = format(editDate, 'yyyy-MM-dd');

      createException.mutate(
        { lesson_id: lesson.id, exception_date: originalDate, type: 'cancelled' },
        {
          onSuccess: () => {
            // Create new one-off with edited values
            createSchedule(
              {
                student_id: data.student_id,
                days_of_week: [effectiveDow],
                start_time: data.start_time,
                end_time: data.end_time,
                recurring: false,
                date: data.date ?? originalDate,
                subject: data.subject,
              },
              {
                onSuccess: () => {
                  toast.success('Clase de este día actualizada');
                  onSuccess();
                },
                onError: () => toast.error('No se pudo crear la clase modificada'),
              },
            );
          },
          onError: () => toast.error('No se pudo modificar la clase'),
        },
      );
    } else {
      // "Todas" or non-recurring: edit the row directly
      const updateData: Record<string, unknown> = {
        student_id: data.student_id,
        day_of_week: effectiveDow,
        start_time: data.start_time,
        end_time: data.end_time,
        recurring: data.recurring,
        date: data.recurring ? null : data.date,
        subject: data.subject,
      };

      updateLesson(updateData, {
        onSuccess: () => {
          if (scope === 'all' && siblingIds.length > 0) {
            for (const sibId of siblingIds) {
              import('@/lib/api-client').then(({ genericAuthRequest }) => {
                genericAuthRequest('patch', `/api/lessons/${sibId}`, {
                  student_id: updateData.student_id,
                  start_time: updateData.start_time,
                  end_time: updateData.end_time,
                });
              });
            }
            toast.success('Todas las clases del grupo actualizadas');
          } else {
            toast.success('Clase actualizada');
          }
          onSuccess();
        },
        onError: () => toast.error('No se pudo actualizar la clase'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <span className="text-xs font-medium text-muted-foreground">
        {isOneOffEdit
          ? `Editando clase del ${format(editDate, "d 'de' MMMM", { locale: es })}`
          : scope === 'all'
            ? 'Editando todas las clases del grupo'
            : 'Editando clase'}
      </span>

      {/* Student */}
      <Controller
        name="student_id"
        control={control}
        render={({ field }) => {
          const selected = options.find((o) => o.value === field.value) ?? null;
          return (
            <Field>
              <FieldLabel>Alumno</FieldLabel>
              <Combobox<StudentOption>
                value={selected}
                onValueChange={(val) => { if (val) field.onChange(val.value); }}
                onInputValueChange={setComboboxInput}
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
            </Field>
          );
        }}
      />

      {/* Day of week (for editing all recurring) */}
      {recurring && !isOneOffEdit && (
        <Controller
          name="day_of_week"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Día de la semana</FieldLabel>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant={field.value === idx ? 'default' : 'outline'}
                    size="icon"
                    className="min-h-[40px] min-w-[40px] flex-1"
                    onClick={() => field.onChange(idx)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Field>
          )}
        />
      )}

      {/* Date (for one-off or single-edit of recurring) */}
      {(!recurring || isOneOffEdit) && (
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Fecha</FieldLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Seleccionar fecha"
              />
            </Field>
          )}
        />
      )}

      {/* Time */}
      <div className="flex gap-3">
        <Controller
          name="start_time"
          control={control}
          render={({ field }) => (
            <Field className="flex-1">
              <FieldLabel htmlFor="edit-start">Inicio</FieldLabel>
              <Input {...field} id="edit-start" type="time" className="h-10" />
            </Field>
          )}
        />
        <Controller
          name="end_time"
          control={control}
          render={({ field }) => (
            <Field className="flex-1">
              <FieldLabel htmlFor="edit-end">Fin</FieldLabel>
              <Input {...field} id="edit-end" type="time" className="h-10" />
            </Field>
          )}
        />
      </div>

      {/* Subject */}
      {teacherSubjects.length > 0 && (
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Materia</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {teacherSubjects.map((sub) => {
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
                        className="size-2 shrink-0 rounded-full"
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

      {/* Collision error */}
      {collisionError && (
        <p className="text-sm text-destructive">{collisionError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 h-10" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 h-10" disabled={isPending}>
          {isPending ? 'Guardando...' : scope === 'all' ? 'Guardar todas' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Lesson card
// ---------------------------------------------------------------------------

function LessonCard({
  lesson,
  studentName,
  date,
  students,
  allLessons,
  isPaid,
  onDeleted,
}: {
  lesson: LessonForDay;
  studentName: string;
  date: Date;
  students: Student[];
  allLessons: Lesson[];
  isPaid: boolean;
  onDeleted: () => void;
}) {
  const [editState, setEditState] = useState<'view' | 'ask-scope' | 'edit-this' | 'edit-all'>('view');

  const hasGroup = lesson.schedule_group_id
    ? allLessons.some((l) => l.schedule_group_id === lesson.schedule_group_id && l.id !== lesson.id)
    : false;

  const handleEditClick = () => {
    if (lesson.recurring && hasGroup) {
      setEditState('ask-scope');
    } else {
      setEditState('edit-this');
    }
  };

  if (editState === 'ask-scope') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <span className="text-sm font-medium text-foreground">¿Qué quieres editar?</span>
        <Button variant="outline" className="h-10" onClick={() => setEditState('edit-this')}>
          Solo esta clase
        </Button>
        <Button variant="outline" className="h-10" onClick={() => setEditState('edit-all')}>
          Todas las del grupo
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditState('view')}>
          Cancelar
        </Button>
      </div>
    );
  }

  if (editState === 'edit-this' || editState === 'edit-all') {
    return (
      <EditLessonForm
        lesson={lesson}
        editDate={date}
        allLessons={allLessons}
        students={students}
        scope={editState === 'edit-all' ? 'all' : 'this'}
        onSuccess={() => setEditState('view')}
        onCancel={() => setEditState('view')}
      />
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-border bg-card p-3 ${
        lesson.cancelled ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-sm font-medium text-card-foreground ${
              lesson.cancelled ? 'line-through' : ''
            }`}
          >
            {studentName}
          </span>
          <span
            className={`text-xs text-muted-foreground ${
              lesson.cancelled ? 'line-through' : ''
            }`}
          >
            {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
          </span>
        </div>

        {lesson.cancelled ? (
          <div className="flex items-center gap-1">
            {lesson.exception && (
              <RestoreLessonButton exceptionId={lesson.exception.id} />
            )}
          </div>
        ) : (
          <LessonActionMenu
            lesson={lesson}
            date={date}
            onEdit={handleEditClick}
            onDeleted={onDeleted}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {lesson.cancelled ? (
          <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
            Cancelada
          </Badge>
        ) : (
          <>
            <SubjectBadge subject={lesson.subject} />
            <Badge variant={lesson.recurring ? 'secondary' : 'outline'} className="text-[10px]">
              {lesson.recurring ? 'Mensual' : 'Puntual'}
            </Badge>
            {lesson.recurring && isPaid && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                Pagado
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day sheet
// ---------------------------------------------------------------------------

export function DaySheet({
  date,
  lessons,
  exceptions,
  students,
  payments,
  formOnly = false,
  onClose,
  onLessonCreated,
  onLessonDeleted,
}: DaySheetProps) {
  const { data: teacher } = useTeacher();
  const teacherSubjects = teacher?.subjects ?? [];
  const [showForm, setShowForm] = useState(formOnly);

  // Sync showForm with formOnly when it changes (e.g., switching views)
  useEffect(() => {
    setShowForm(formOnly);
  }, [formOnly]);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  const dayLessons = useMemo(() => {
    if (!date) return [];
    return getLessonsForDay(date, lessons, exceptions).sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );
  }, [date, lessons, exceptions]);

  const activeLessons = dayLessons.filter((l) => !l.cancelled);
  const cancelledLessons = dayLessons.filter((l) => l.cancelled);

  const paidStudentIds = useMemo(() => {
    if (!date) return new Set<string>();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const ids = new Set<string>();
    for (const p of payments) {
      if (p.month === month && p.year === year && p.paid) {
        ids.add(p.student_id);
      }
    }
    return ids;
  }, [date, payments]);

  const title = useMemo(() => {
    if (!date) return '';
    const raw = format(date, "EEEE d 'de' MMMM", { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [date]);

  const handleLessonCreated = () => {
    setShowForm(false);
    onLessonCreated();
  };

  return (
    <Sheet open={date !== null} onOpenChange={(open) => { if (!open) { setShowForm(formOnly); onClose(); } }}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        {!formOnly && (
          <>
            <div className="flex flex-col gap-2 px-4">
              {activeLessons.length === 0 && cancelledLessons.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <CalendarX className="size-8" />
                  <p className="text-sm">Sin clases este día</p>
                </div>
              ) : (
                <>
                  {activeLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      studentName={studentMap.get(lesson.student_id) ?? 'Alumno'}
                      date={date!}
                      students={students}
                      allLessons={lessons}
                      isPaid={paidStudentIds.has(lesson.student_id)}
                      onDeleted={onLessonDeleted}
                    />
                  ))}
                  {cancelledLessons.length > 0 && activeLessons.length > 0 && (
                    <Separator className="my-1" />
                  )}
                  {cancelledLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      studentName={studentMap.get(lesson.student_id) ?? 'Alumno'}
                      date={date!}
                      students={students}
                      allLessons={lessons}
                      isPaid={paidStudentIds.has(lesson.student_id)}
                      onDeleted={onLessonDeleted}
                    />
                  ))}
                </>
              )}
            </div>
            <Separator />
          </>
        )}

        <div className="px-4 pb-4">
          {showForm && date ? (
            <LessonForm
              date={date}
              students={students}
              onSuccess={handleLessonCreated}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Agregar clase
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
