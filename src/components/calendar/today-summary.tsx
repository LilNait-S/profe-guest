'use client';

import { useMemo } from 'react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ArrowRight } from 'lucide-react';

import { getLessonsForDay } from '@/lib/calendar-utils';
import type { Lesson, LessonException, Student } from '@/types';

interface TodaySummaryProps {
  lessons: Lesson[];
  exceptions: LessonException[];
  students: Student[];
  onDayClick: (date: Date) => void;
}

export function TodaySummary({
  lessons,
  exceptions,
  students,
  onDayClick,
}: TodaySummaryProps) {
  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s.name])),
    [students],
  );

  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const today = now;
  const tomorrow = addDays(now, 1);

  const { displayDate, displayLessons, label } = useMemo(() => {
    const todayLessons = getLessonsForDay(today, lessons, exceptions)
      .filter((l) => !l.cancelled)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    // Filter to upcoming lessons (end_time hasn't passed yet)
    const upcoming = todayLessons.filter(
      (l) => l.end_time.slice(0, 5) > currentTime,
    );

    if (upcoming.length > 0) {
      return {
        displayDate: today,
        displayLessons: upcoming,
        label: 'Hoy',
      };
    }

    // All done for today — show tomorrow
    const tomorrowLessons = getLessonsForDay(tomorrow, lessons, exceptions)
      .filter((l) => !l.cancelled)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return {
      displayDate: tomorrow,
      displayLessons: tomorrowLessons,
      label: 'Mañana',
    };
  }, [today, tomorrow, lessons, exceptions, currentTime]);

  if (displayLessons.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className="mt-3 flex w-full cursor-pointer flex-col gap-2 rounded-xl bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
      onClick={() => onDayClick(displayDate)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {label}
          </span>
          <span className="text-xs text-muted-foreground">
            {displayLessons.length} clase{displayLessons.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>

      {/* Lesson list */}
      <div className="flex flex-col gap-1">
        {displayLessons.map((lesson) => (
          <div key={lesson.id} className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-primary">
              {lesson.start_time.slice(0, 5)}
            </span>
            <span className="text-xs text-foreground">
              {studentMap.get(lesson.student_id) ?? 'Alumno'}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}
