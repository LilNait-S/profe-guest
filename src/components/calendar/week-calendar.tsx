'use client';

import { useState, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, CalendarOff, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getWeekDays, getWeekLabel, getLessonsForDay } from '@/lib/calendar-utils';
import { isNonWorkingDay, getNonWorkingLabel } from '@/lib/holidays';
import { getSubjectColor } from '@/lib/subject-colors';
import { useTeacher } from '@/services/teacher';
import { useDeleteLesson, useCreateException, useDeleteException } from '@/services/lessons';
import { LessonForm } from '@/components/calendar/lesson-form';
import type { Lesson, LessonException, LessonForDay, Student } from '@/types';

const FULL_DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Inline lesson actions for week view
// ---------------------------------------------------------------------------

function WeekLessonMenu({
  lesson,
  date,
  onDeleted,
}: {
  lesson: LessonForDay;
  date: Date;
  onDeleted: () => void;
}) {
  const deleteLesson = useDeleteLesson(lesson.id);
  const createException = useCreateException();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-xs" aria-label="Opciones" />
        }
      >
        <MoreVertical className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {lesson.recurring && (
          <>
            <DropdownMenuItem
              onClick={() =>
                createException.mutate(
                  { lesson_id: lesson.id, exception_date: format(date, 'yyyy-MM-dd'), type: 'cancelled' },
                  {
                    onSuccess: () => toast.success('Clase cancelada'),
                    onError: () => toast.error('No se pudo cancelar'),
                  },
                )
              }
            >
              <CalendarOff />
              Cancelar esta clase
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            if (!confirm(lesson.recurring ? '¿Eliminar horario completo?' : '¿Eliminar esta clase?')) return;
            deleteLesson.mutate(undefined, {
              onSuccess: () => { toast.success('Eliminada'); onDeleted(); },
            });
          }}
        >
          <Trash2 />
          {lesson.recurring ? 'Eliminar horario' : 'Eliminar clase'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RestoreButton({ exceptionId }: { exceptionId: string }) {
  const { mutate, isPending } = useDeleteException(exceptionId);
  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={isPending}
      onClick={() => mutate(undefined, {
        onSuccess: () => toast.success('Restaurada'),
        onError: () => toast.error('No se pudo restaurar'),
      })}
    >
      <RotateCcw className="size-3" data-icon="inline-start" />
      Restaurar
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Week calendar
// ---------------------------------------------------------------------------

interface WeekCalendarProps {
  lessons: Lesson[];
  exceptions: LessonException[];
  students: Student[];
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDayClick: (date: Date) => void;
}

export function WeekCalendar({
  lessons,
  exceptions,
  students,
  currentDate,
  onPrevWeek,
  onNextWeek,
  onDayClick,
}: WeekCalendarProps) {
  const days = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const weekLabel = useMemo(() => capitalizeFirst(getWeekLabel(currentDate)), [currentDate]);
  const { data: teacher } = useTeacher();
  const teacherSubjects = teacher?.subjects ?? [];
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    if (expandedDay === key) {
      setExpandedDay(null);
      setShowForm(false);
    } else {
      setExpandedDay(key);
      setShowForm(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevWeek}
          aria-label="Semana anterior"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-sm font-semibold text-foreground text-center">
          {weekLabel}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          aria-label="Semana siguiente"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Day rows */}
      <div className="flex flex-col gap-1">
        {days.map((date, idx) => {
          const key = format(date, 'yyyy-MM-dd');
          const dayLessons = getLessonsForDay(date, lessons, exceptions);
          const activeLessons = dayLessons.filter((l) => !l.cancelled);
          const cancelledLessons = dayLessons.filter((l) => l.cancelled);
          const today = isToday(date);
          const nonWorking = isNonWorkingDay(date);
          const nonWorkingLabel = getNonWorkingLabel(date);
          const isExpanded = expandedDay === key;

          return (
            <div key={key}>
              {/* Day summary row */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleDayClick(date)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDayClick(date); }}
                className={
                  'flex min-h-[56px] w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors' +
                  (isExpanded
                    ? ' border-primary/30 bg-primary/5 rounded-b-none'
                    : today
                      ? ' border-primary/30 bg-primary/5 hover:bg-primary/10'
                      : nonWorking
                        ? ' border-destructive/20 bg-destructive/5 hover:bg-destructive/10'
                        : ' border-border hover:bg-muted/50')
                }
              >
                {/* Day label */}
                <div className="flex w-16 shrink-0 flex-col items-center">
                  <span className={`text-xs ${nonWorking ? 'text-destructive/70' : 'text-muted-foreground'}`}>
                    {FULL_DAY_NAMES[idx]}
                  </span>
                  <span
                    className={
                      'inline-flex size-8 items-center justify-center rounded-full text-sm font-medium' +
                      (today ? ' bg-primary text-primary-foreground' : ' text-foreground')
                    }
                  >
                    {format(date, 'd')}
                  </span>
                </div>

                {/* Lessons preview */}
                <div className="flex flex-1 flex-col gap-1 pt-0.5">
                  {nonWorkingLabel && (
                    <span className="text-[11px] font-medium text-destructive/70">
                      {nonWorkingLabel}
                    </span>
                  )}
                  {activeLessons.length === 0 && cancelledLessons.length === 0 && !nonWorking && (
                    <span className="text-xs text-muted-foreground">Sin clases</span>
                  )}
                  {activeLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {studentMap.get(lesson.student_id) ?? 'Alumno'}
                      </span>
                      {lesson.subject && (() => {
                        const sColor = getSubjectColor(lesson.subject, teacherSubjects);
                        return (
                          <span className="flex items-center gap-0.5 text-[10px]" style={sColor ? { color: sColor } : undefined}>
                            {sColor && <span className="size-1.5 rounded-full" style={{ backgroundColor: sColor }} />}
                            {lesson.subject}
                          </span>
                        );
                      })()}
                    </div>
                  ))}
                  {cancelledLessons.length > 0 && !isExpanded && (
                    <span className="text-[10px] text-muted-foreground">
                      +{cancelledLessons.length} cancelada{cancelledLessons.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Lesson count indicator */}
                {(activeLessons.length + cancelledLessons.length) > 0 && !isExpanded && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activeLessons.length + cancelledLessons.length}
                  </span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="flex flex-col gap-2 rounded-b-lg border border-t-0 border-primary/30 bg-primary/5 p-3">
                  {/* Active lessons with actions */}
                  {activeLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-md bg-card p-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-card-foreground">
                          {studentMap.get(lesson.student_id) ?? 'Alumno'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={lesson.recurring ? 'secondary' : 'outline'} className="text-[10px]">
                          {lesson.recurring ? 'Mensual' : 'Puntual'}
                        </Badge>
                        <WeekLessonMenu lesson={lesson} date={date} onDeleted={() => {}} />
                      </div>
                    </div>
                  ))}

                  {/* Cancelled lessons */}
                  {cancelledLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-md bg-card p-2 opacity-60">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-card-foreground line-through">
                          {studentMap.get(lesson.student_id) ?? 'Alumno'}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                          Cancelada
                        </Badge>
                        {lesson.exception && <RestoreButton exceptionId={lesson.exception.id} />}
                      </div>
                    </div>
                  ))}

                  {/* Add lesson */}
                  {showForm ? (
                    <LessonForm
                      date={date}
                      students={students}
                      onSuccess={() => setShowForm(false)}
                      onCancel={() => setShowForm(false)}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
                    >
                      <Plus className="size-3.5" data-icon="inline-start" />
                      Agregar clase
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
