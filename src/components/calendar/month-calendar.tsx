'use client';

import { useMemo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCalendarDays, getLessonsForDay } from '@/lib/calendar-utils';
import type { Lesson, Student } from '@/types';

interface MonthCalendarProps {
  lessons: Lesson[];
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
  students,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: MonthCalendarProps) {
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
      map.set(key, getLessonsForDay(day, lessons));
    }
    return map;
  }, [days, lessons]);

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
      <div className="grid grid-cols-7">
        {SHORT_DAY_NAMES.map((shortName, i) => (
          <div
            key={i}
            className="py-1 text-center text-xs font-medium text-muted-foreground"
          >
            <span className="sm:hidden">{shortName}</span>
            <span className="hidden sm:inline">{FULL_DAY_NAMES[i]}</span>
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 border-t border-border">
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const dayLessons = lessonsByDay.get(key) ?? [];
          const inCurrentMonth = isSameMonth(date, currentMonth);
          const today = isToday(date);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(date)}
              className={
                'flex min-h-[52px] cursor-pointer flex-col items-start border-b border-r border-border p-1 transition-colors hover:bg-muted/50 sm:min-h-[80px] sm:p-1.5' +
                (!inCurrentMonth ? ' opacity-40' : '')
              }
            >
              {/* Day number */}
              <span
                className={
                  'mb-0.5 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium sm:size-7 sm:text-sm' +
                  (today
                    ? ' bg-primary text-primary-foreground'
                    : inCurrentMonth
                      ? ' text-foreground'
                      : ' text-muted-foreground')
                }
              >
                {format(date, 'd')}
              </span>

              {/* Lesson indicators */}
              {dayLessons.length > 0 && (
                <>
                  {/* Mobile: dots */}
                  <div className="mt-auto flex items-center gap-0.5 sm:hidden">
                    {dayLessons.slice(0, 3).map((lesson) => (
                      <span
                        key={lesson.id}
                        className="block size-1.5 rounded-full bg-primary"
                      />
                    ))}
                    {dayLessons.length > 3 && (
                      <span className="text-[9px] leading-none text-muted-foreground">
                        +{dayLessons.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Desktop: compact text */}
                  <div className="mt-0.5 hidden w-full flex-col gap-px sm:flex">
                    {dayLessons.slice(0, 3).map((lesson) => (
                      <span
                        key={lesson.id}
                        className="block truncate text-[10px] leading-tight text-foreground"
                      >
                        {lesson.start_time.slice(0, 5)}{' '}
                        {studentNameMap.get(lesson.student_id) ?? ''}
                      </span>
                    ))}
                    {dayLessons.length > 3 && (
                      <span className="text-[10px] leading-tight text-muted-foreground">
                        {`+${dayLessons.length - 3} m\u00e1s`}
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
