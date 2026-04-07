'use client';

import { useMemo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCalendarDays, getLessonsForDay } from '@/lib/calendar-utils';
import { isNonWorkingDay, getNonWorkingLabel } from '@/lib/holidays';
import { getSubjectColor } from '@/lib/subject-colors';
import { useTeacher } from '@/services/teacher';
import type { Lesson, LessonException, Student } from '@/types';

interface MonthCalendarProps {
  lessons: Lesson[];
  exceptions: LessonException[];
  students: Student[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
}

const SHORT_DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;
const FULL_DAY_NAMES = [
  'Lun',
  'Mar',
  'Mi\u00e9',
  'Jue',
  'Vie',
  'S\u00e1b',
  'Dom',
] as const;

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function MonthCalendar({
  lessons,
  exceptions,
  students,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: MonthCalendarProps) {
  const { data: teacher } = useTeacher();
  const teacherSubjects = teacher?.subjects ?? [];
  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const studentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const student of students) {
      map.set(student.id, student.name);
    }
    return map;
  }, [students]);

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      const dayLessons = getLessonsForDay(day, lessons, exceptions);
      // Only show non-cancelled lessons in the calendar grid
      map.set(key, dayLessons.filter((l) => !l.cancelled));
    }
    return map;
  }, [days, lessons, exceptions]);

  const monthLabel = capitalizeFirst(
    format(currentMonth, 'MMMM yyyy', { locale: es }),
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-base font-semibold text-foreground">{monthLabel}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {SHORT_DAY_NAMES.map((shortName, i) => (
          <div
            key={i}
            className="flex items-center justify-center py-2 text-xs font-medium text-muted-foreground"
          >
            <span className="sm:hidden">{shortName}</span>
            <span className="hidden sm:inline">{FULL_DAY_NAMES[i]}</span>
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const dayLessons = lessonsByDay.get(key) ?? [];
          const inCurrentMonth = isSameMonth(date, currentMonth);
          const today = isToday(date);
          const nonWorking = inCurrentMonth ? isNonWorkingDay(date) : false;
          const nonWorkingLabel = inCurrentMonth ? getNonWorkingLabel(date) : null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(date)}
              title={nonWorkingLabel ?? undefined}
              className={
                'flex min-h-[48px] cursor-pointer flex-col items-center overflow-hidden rounded-lg p-1.5 transition-colors sm:min-h-[80px] sm:p-2' +
                (today
                  ? ' bg-primary/10 ring-1 ring-primary/30'
                  : nonWorking
                    ? ' bg-destructive/5'
                    : ' hover:bg-muted/50') +
                (!inCurrentMonth ? ' opacity-30' : '')
              }
            >
              {/* Day number */}
              <span
                className={
                  'inline-flex size-7 items-center justify-center rounded-full text-sm font-medium' +
                  (today
                    ? ' bg-primary text-primary-foreground'
                    : nonWorking
                      ? ' text-destructive/70'
                      : inCurrentMonth
                        ? ' text-foreground'
                        : ' text-muted-foreground')
                }
              >
                {format(date, 'd')}
              </span>
              {/* Holiday label (not for plain Sundays) */}
              {nonWorkingLabel && nonWorkingLabel !== 'Domingo' && (
                <span className="mt-0.5 hidden w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[8px] leading-tight text-destructive/70 sm:block">
                  {nonWorkingLabel}
                </span>
              )}

              {/* Lesson indicators */}
              {dayLessons.length > 0 && (
                <>
                  {/* Mobile: dots */}
                  <div className="mt-auto flex items-center gap-0.5 sm:hidden">
                    {dayLessons.slice(0, 3).map((lesson) => {
                      const dotColor = getSubjectColor(lesson.subject, teacherSubjects);
                      return (
                        <span
                          key={lesson.id}
                          className={`block size-1.5 rounded-full ${dotColor ? '' : 'bg-muted-foreground/40'}`}
                          style={dotColor ? { backgroundColor: dotColor } : undefined}
                        />
                      );
                    })}
                    {dayLessons.length > 3 && (
                      <span className="text-[9px] leading-none text-muted-foreground">
                        +{dayLessons.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Desktop: compact text */}
                  <div className="mt-0.5 hidden w-full flex-col gap-px sm:flex">
                    {dayLessons.slice(0, 3).map((lesson) => {
                      const textColor = getSubjectColor(lesson.subject, teacherSubjects);
                      return (
                        <span
                          key={lesson.id}
                          className={`flex items-center gap-1 truncate rounded px-1 text-[10px] leading-relaxed text-foreground ${textColor ? '' : 'bg-muted-foreground/10'}`}
                          style={textColor ? { backgroundColor: `${textColor}20` } : undefined}
                        >
                          {textColor && (
                            <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: textColor }} />
                          )}
                          {lesson.start_time.slice(0, 5)}{' '}
                          {studentNameMap.get(lesson.student_id) ?? ''}
                        </span>
                      );
                    })}
                    {dayLessons.length > 3 && (
                      <span className="text-[10px] leading-tight text-muted-foreground">
                        {`+${dayLessons.length - 3} más`}
                      </span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
