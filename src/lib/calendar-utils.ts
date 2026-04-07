import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  format,
  isSameMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Lesson, LessonException, LessonForDay } from '@/types';

/**
 * Returns all dates to display in a monthly calendar grid (Mon-start).
 * Includes leading/trailing days from adjacent months to fill the grid.
 */
export function getCalendarDays(month: Date): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

/**
 * Converts JS getDay() (Sun=0) to our Monday-based index (Mon=0).
 */
export function toDayOfWeek(date: Date): number {
  return (getDay(date) + 6) % 7;
}

/**
 * Checks if a recurring lesson is active on a given date,
 * considering start_date and end_date bounds.
 */
export function isLessonActiveOnDate(lesson: Lesson, dateStr: string): boolean {
  if (lesson.start_date && dateStr < lesson.start_date) return false;
  if (lesson.end_date && dateStr > lesson.end_date) return false;
  return true;
}

/**
 * Returns lessons that should appear on a specific calendar date,
 * with exception info attached. Checks date bounds for recurring lessons.
 */
export function getLessonsForDay(
  date: Date,
  lessons: Lesson[],
  exceptions: LessonException[] = [],
): LessonForDay[] {
  const dayOfWeek = toDayOfWeek(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  // Build a lookup: lesson_id -> exception for this date
  const exceptionMap = new Map<string, LessonException>();
  for (const ex of exceptions) {
    if (ex.exception_date === dateStr) {
      exceptionMap.set(ex.lesson_id, ex);
    }
  }

  return lessons
    .filter((l) => {
      // One-off: exact date match
      if (!l.recurring && l.date === dateStr) return true;
      // Recurring: weekday match + date bounds
      if (l.recurring && !l.date && l.day_of_week === dayOfWeek) {
        return isLessonActiveOnDate(l, dateStr);
      }
      return false;
    })
    .map((l) => {
      const exception = exceptionMap.get(l.id) ?? null;
      return {
        ...l,
        exception,
        cancelled: exception?.type === 'cancelled',
      };
    });
}

/**
 * Returns the 7 days (Mon-Sun) of the week containing the given date.
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Returns a formatted label for the week, e.g. "Sem 15: 6 – 12 de abril 2026"
 * If the week spans two months: "Sem 15: 30 mar – 5 abr 2026"
 */
function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getWeekLabel(date: Date): string {
  const days = getWeekDays(date);
  const monday = days[0];
  const sunday = days[6];

  if (isSameMonth(monday, sunday)) {
    const monthYear = capitalizeFirst(format(monday, "MMMM yyyy", { locale: es }));
    return `${format(monday, 'd')} – ${format(sunday, 'd')} de ${monthYear}`;
  }

  const startLabel = format(monday, "d MMM", { locale: es });
  const endLabel = format(sunday, "d MMM yyyy", { locale: es });
  return `${startLabel} – ${endLabel}`;
}
