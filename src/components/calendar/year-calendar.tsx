'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCalendarDays, getLessonsForDay } from '@/lib/calendar-utils';
import type { Lesson, LessonException } from '@/types';

interface YearCalendarProps {
  currentYear: number;
  lessons: Lesson[];
  exceptions: LessonException[];
  onMonthClick: (month: Date) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function MiniMonth({
  month,
  lessons,
  exceptions,
  onClick,
}: {
  month: Date;
  lessons: Lesson[];
  exceptions: LessonException[];
  onClick: () => void;
}) {
  const monthName = capitalizeFirst(format(month, 'MMM', { locale: es }));
  const today = new Date();
  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  // Get all days of this month to check which have lessons
  const monthDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const daysWithLessons = useMemo(() => {
    const set = new Set<number>();
    for (const day of monthDays) {
      const dayLessons = getLessonsForDay(day, lessons, exceptions);
      if (dayLessons.some((l) => !l.cancelled)) {
        set.add(day.getDate());
      }
    }
    return set;
  }, [monthDays, lessons, exceptions]);

  // Build mini grid (Mon-start)
  const gridDays = useMemo(() => getCalendarDays(month), [month]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 transition-colors hover:bg-muted/50' +
        (isCurrentMonth
          ? ' border-primary/30 bg-primary/5'
          : ' border-border')
      }
    >
      <span
        className={
          'text-xs font-semibold' +
          (isCurrentMonth ? ' text-primary' : ' text-foreground')
        }
      >
        {monthName}
      </span>

      {/* Mini day grid */}
      <div className="grid grid-cols-7 gap-px">
        {gridDays.slice(0, 42).map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const hasLesson = inMonth && daysWithLessons.has(day.getDate());
          const isTodayDate = isToday(day) && inMonth;

          return (
            <div
              key={day.toISOString()}
              className={
                'flex size-3.5 items-center justify-center rounded-full text-[7px] leading-none' +
                (!inMonth
                  ? ' opacity-0'
                  : isTodayDate
                    ? ' bg-primary text-primary-foreground font-bold'
                    : hasLesson
                      ? ' bg-primary/20 text-primary font-medium'
                      : ' text-muted-foreground')
              }
            >
              {inMonth ? day.getDate() : ''}
            </div>
          );
        })}
      </div>
    </button>
  );
}

export function YearCalendar({
  currentYear,
  lessons,
  exceptions,
  onMonthClick,
  onPrevYear,
  onNextYear,
}: YearCalendarProps) {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));
  }, [currentYear]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevYear}
          aria-label="Año anterior"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-base font-semibold text-foreground">{currentYear}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextYear}
          aria-label="Año siguiente"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* 3×4 grid of mini months */}
      <div className="grid grid-cols-3 gap-2">
        {months.map((month) => (
          <MiniMonth
            key={month.getMonth()}
            month={month}
            lessons={lessons}
            exceptions={exceptions}
            onClick={() => onMonthClick(month)}
          />
        ))}
      </div>
    </div>
  );
}
