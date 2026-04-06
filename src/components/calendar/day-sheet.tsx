'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Plus, CalendarX } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDeleteLesson } from '@/services/lessons';
import { getLessonsForDay } from '@/lib/calendar-utils';
import { LessonForm } from '@/components/calendar/lesson-form';
import type { Lesson, Student } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DaySheetProps {
  date: Date | null;
  lessons: Lesson[];
  students: Student[];
  onClose: () => void;
  onLessonCreated: () => void;
  onLessonDeleted: () => void;
}

// ---------------------------------------------------------------------------
// Delete button (needs its own component so the hook receives the id)
// ---------------------------------------------------------------------------

function DeleteLessonButton({
  lessonId,
  onDeleted,
}: {
  lessonId: string;
  onDeleted: () => void;
}) {
  const { mutate, isPending } = useDeleteLesson(lessonId);

  const handleDelete = () => {
    if (!confirm('¿Eliminar esta clase?')) return;

    mutate(undefined, {
      onSuccess: () => {
        toast.success('Clase eliminada');
        onDeleted();
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      disabled={isPending}
      onClick={handleDelete}
      aria-label="Eliminar clase"
    >
      <Trash2 className="size-3.5 text-muted-foreground" />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Day sheet
// ---------------------------------------------------------------------------

export function DaySheet({
  date,
  lessons,
  students,
  onClose,
  onLessonCreated,
  onLessonDeleted,
}: DaySheetProps) {
  const [showForm, setShowForm] = useState(false);

  // Build a lookup map: student_id -> name
  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  // Filter & sort lessons for the selected day
  const dayLessons = useMemo(() => {
    if (!date) return [];
    return getLessonsForDay(date, lessons).sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );
  }, [date, lessons]);

  // Format the title: "Lunes 14 de abril" with first letter capitalised
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
    <Sheet open={date !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        {/* Lesson list */}
        <div className="flex flex-col gap-2 px-4">
          {dayLessons.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <CalendarX className="size-8" />
              <p className="text-sm">Sin clases este día</p>
            </div>
          ) : (
            dayLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                {/* Left side: name + time */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-card-foreground">
                    {studentMap.get(lesson.student_id) ?? 'Alumno'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lesson.start_time} – {lesson.end_time}
                  </span>
                </div>

                {/* Right side: badge + delete */}
                <div className="flex items-center gap-2">
                  <Badge variant={lesson.recurring ? 'secondary' : 'outline'}>
                    {lesson.recurring ? 'Semanal' : 'Puntual'}
                  </Badge>
                  <DeleteLessonButton
                    lessonId={lesson.id}
                    onDeleted={onLessonDeleted}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Add lesson section */}
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
