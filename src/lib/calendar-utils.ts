import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  format,
} from 'date-fns';
import type { Lesson } from '@/types';

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
 * Returns lessons that should appear on a specific calendar date.
 * Includes recurring lessons matching the weekday + one-off lessons on that exact date.
 */
export function getLessonsForDay(date: Date, lessons: Lesson[]): Lesson[] {
  const dayOfWeek = toDayOfWeek(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  return lessons.filter(
    (l) =>
      (l.recurring && !l.date && l.day_of_week === dayOfWeek) ||
      l.date === dateStr,
  );
}
