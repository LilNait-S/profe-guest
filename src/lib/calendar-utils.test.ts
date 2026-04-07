import { describe, it, expect } from 'vitest';
import { getCalendarDays, toDayOfWeek, getLessonsForDay, isLessonActiveOnDate, getWeekDays, getWeekLabel } from './calendar-utils';
import type { Lesson, LessonException } from '@/types';

const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: '1',
  student_id: 'student-1',
  day_of_week: 0, // Monday
  start_time: '09:00',
  end_time: '10:00',
  recurring: true,
  date: null,
  start_date: null,
  end_date: null,
  schedule_group_id: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeException = (overrides: Partial<LessonException> = {}): LessonException => ({
  id: 'ex-1',
  lesson_id: '1',
  exception_date: '2026-04-06',
  type: 'cancelled',
  reason: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('toDayOfWeek', () => {
  it('converts Monday to 0', () => {
    expect(toDayOfWeek(new Date(2026, 3, 6))).toBe(0);
  });

  it('converts Sunday to 6', () => {
    expect(toDayOfWeek(new Date(2026, 3, 12))).toBe(6);
  });

  it('converts Wednesday to 2', () => {
    expect(toDayOfWeek(new Date(2026, 3, 8))).toBe(2);
  });

  it('converts Friday to 4', () => {
    expect(toDayOfWeek(new Date(2026, 3, 10))).toBe(4);
  });
});

describe('getCalendarDays', () => {
  it('returns an array of dates starting on Monday', () => {
    const days = getCalendarDays(new Date(2026, 3, 1));
    expect(days[0].getDay()).toBe(1);
  });

  it('returns full weeks (multiple of 7)', () => {
    const days = getCalendarDays(new Date(2026, 3, 1));
    expect(days.length % 7).toBe(0);
  });

  it('includes all days of the month', () => {
    const days = getCalendarDays(new Date(2026, 3, 1));
    const aprilDays = days.filter(
      (d) => d.getMonth() === 3 && d.getFullYear() === 2026,
    );
    expect(aprilDays.length).toBe(30);
  });

  it('includes leading days from previous month', () => {
    const days = getCalendarDays(new Date(2026, 3, 1));
    const marchDays = days.filter(
      (d) => d.getMonth() === 2 && d.getFullYear() === 2026,
    );
    expect(marchDays.length).toBeGreaterThan(0);
  });
});

describe('isLessonActiveOnDate', () => {
  it('returns true when no date bounds', () => {
    const lesson = makeLesson();
    expect(isLessonActiveOnDate(lesson, '2026-04-06')).toBe(true);
  });

  it('returns true when date is within bounds', () => {
    const lesson = makeLesson({ start_date: '2026-04-01', end_date: '2026-06-30' });
    expect(isLessonActiveOnDate(lesson, '2026-04-15')).toBe(true);
  });

  it('returns false when date is before start_date', () => {
    const lesson = makeLesson({ start_date: '2026-04-01' });
    expect(isLessonActiveOnDate(lesson, '2026-03-31')).toBe(false);
  });

  it('returns false when date is after end_date', () => {
    const lesson = makeLesson({ end_date: '2026-06-30' });
    expect(isLessonActiveOnDate(lesson, '2026-07-01')).toBe(false);
  });

  it('returns true on exact start_date', () => {
    const lesson = makeLesson({ start_date: '2026-04-06' });
    expect(isLessonActiveOnDate(lesson, '2026-04-06')).toBe(true);
  });

  it('returns true on exact end_date', () => {
    const lesson = makeLesson({ end_date: '2026-04-06' });
    expect(isLessonActiveOnDate(lesson, '2026-04-06')).toBe(true);
  });
});

describe('getLessonsForDay', () => {
  it('returns recurring lessons matching the weekday', () => {
    const monday = new Date(2026, 3, 6);
    const result = getLessonsForDay(monday, [makeLesson()]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].cancelled).toBe(false);
    expect(result[0].exception).toBeNull();
  });

  it('returns one-off lessons matching the exact date', () => {
    const friday = new Date(2026, 3, 10);
    const oneOff = makeLesson({
      id: '2',
      recurring: false,
      date: '2026-04-10',
      day_of_week: 4,
    });
    const result = getLessonsForDay(friday, [oneOff]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns empty array for days with no lessons', () => {
    const tuesday = new Date(2026, 3, 7);
    const result = getLessonsForDay(tuesday, [makeLesson()]);
    expect(result).toHaveLength(0);
  });

  it('excludes recurring lessons outside date bounds', () => {
    const monday = new Date(2026, 3, 6);
    const lesson = makeLesson({ start_date: '2026-05-01' }); // starts May
    const result = getLessonsForDay(monday, [lesson]);
    expect(result).toHaveLength(0);
  });

  it('includes recurring lessons within date bounds', () => {
    const monday = new Date(2026, 3, 6);
    const lesson = makeLesson({ start_date: '2026-04-01', end_date: '2026-06-30' });
    const result = getLessonsForDay(monday, [lesson]);
    expect(result).toHaveLength(1);
  });

  it('marks cancelled lessons with exception info', () => {
    const monday = new Date(2026, 3, 6);
    const exception = makeException({ lesson_id: '1', exception_date: '2026-04-06' });
    const result = getLessonsForDay(monday, [makeLesson()], [exception]);
    expect(result).toHaveLength(1);
    expect(result[0].cancelled).toBe(true);
    expect(result[0].exception?.id).toBe('ex-1');
  });

  it('does not mark non-matching exceptions as cancelled', () => {
    const monday = new Date(2026, 3, 6);
    const exception = makeException({ lesson_id: '1', exception_date: '2026-04-13' }); // different Monday
    const result = getLessonsForDay(monday, [makeLesson()], [exception]);
    expect(result).toHaveLength(1);
    expect(result[0].cancelled).toBe(false);
  });

  it('does not match one-off lessons on different dates with same weekday', () => {
    const otherFriday = new Date(2026, 3, 17);
    const oneOff = makeLesson({
      id: '2',
      recurring: false,
      date: '2026-04-10',
      day_of_week: 4,
    });
    const result = getLessonsForDay(otherFriday, [oneOff]);
    expect(result).toHaveLength(0);
  });
});

describe('getWeekDays', () => {
  it('returns 7 days starting on Monday', () => {
    const days = getWeekDays(new Date(2026, 3, 8)); // Wednesday April 8
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1); // Monday
    expect(days[6].getDay()).toBe(0); // Sunday
  });

  it('returns correct Monday-Sunday for a given date', () => {
    const days = getWeekDays(new Date(2026, 3, 6)); // Monday April 6
    expect(days[0].getDate()).toBe(6); // Mon Apr 6
    expect(days[6].getDate()).toBe(12); // Sun Apr 12
  });

  it('handles week spanning two months', () => {
    const days = getWeekDays(new Date(2026, 3, 1)); // Wed April 1
    // Monday March 30 to Sunday April 5
    expect(days[0].getMonth()).toBe(2); // March
    expect(days[6].getMonth()).toBe(3); // April
  });
});

describe('getWeekLabel', () => {
  it('formats label within same month', () => {
    const label = getWeekLabel(new Date(2026, 3, 6)); // Mon April 6
    expect(label).toMatch(/6 – 12 de Abril 2026/);
  });

  it('formats label spanning two months', () => {
    const label = getWeekLabel(new Date(2026, 3, 1)); // Wed April 1
    // Mon March 30 - Sun April 5
    expect(label).toMatch(/30 mar – 5 abr 2026/);
  });
});
