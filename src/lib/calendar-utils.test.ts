import { describe, it, expect } from 'vitest';
import { getCalendarDays, toDayOfWeek, getLessonsForDay } from './calendar-utils';
import type { Lesson } from '@/types';

describe('toDayOfWeek', () => {
  it('converts Monday to 0', () => {
    // 2026-04-06 is a Monday
    expect(toDayOfWeek(new Date(2026, 3, 6))).toBe(0);
  });

  it('converts Sunday to 6', () => {
    // 2026-04-12 is a Sunday
    expect(toDayOfWeek(new Date(2026, 3, 12))).toBe(6);
  });

  it('converts Wednesday to 2', () => {
    // 2026-04-08 is a Wednesday
    expect(toDayOfWeek(new Date(2026, 3, 8))).toBe(2);
  });

  it('converts Friday to 4', () => {
    // 2026-04-10 is a Friday
    expect(toDayOfWeek(new Date(2026, 3, 10))).toBe(4);
  });
});

describe('getCalendarDays', () => {
  it('returns an array of dates starting on Monday', () => {
    const days = getCalendarDays(new Date(2026, 3, 1)); // April 2026
    expect(days[0].getDay()).toBe(1); // Monday
  });

  it('returns full weeks (multiple of 7)', () => {
    const days = getCalendarDays(new Date(2026, 3, 1));
    expect(days.length % 7).toBe(0);
  });

  it('includes all days of the month', () => {
    const days = getCalendarDays(new Date(2026, 3, 1)); // April has 30 days
    const aprilDays = days.filter(
      (d) => d.getMonth() === 3 && d.getFullYear() === 2026,
    );
    expect(aprilDays.length).toBe(30);
  });

  it('includes leading days from previous month', () => {
    const days = getCalendarDays(new Date(2026, 3, 1)); // April 2026 starts on Wednesday
    // Monday and Tuesday of the first week are from March
    const marchDays = days.filter(
      (d) => d.getMonth() === 2 && d.getFullYear() === 2026,
    );
    expect(marchDays.length).toBeGreaterThan(0);
  });
});

describe('getLessonsForDay', () => {
  const baseLessonRecurring: Lesson = {
    id: '1',
    student_id: 'student-1',
    day_of_week: 0, // Monday
    start_time: '09:00',
    end_time: '10:00',
    recurring: true,
    date: null,
    created_at: '2026-01-01T00:00:00Z',
  };

  const baseLessonOneOff: Lesson = {
    id: '2',
    student_id: 'student-2',
    day_of_week: 4, // Friday
    start_time: '14:00',
    end_time: '15:00',
    recurring: false,
    date: '2026-04-10',
    created_at: '2026-01-01T00:00:00Z',
  };

  it('returns recurring lessons matching the weekday', () => {
    const monday = new Date(2026, 3, 6); // Monday
    const result = getLessonsForDay(monday, [baseLessonRecurring, baseLessonOneOff]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns one-off lessons matching the exact date', () => {
    const friday = new Date(2026, 3, 10); // 2026-04-10
    const result = getLessonsForDay(friday, [baseLessonRecurring, baseLessonOneOff]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns both recurring and one-off if they match the same day', () => {
    const mondayOneOff: Lesson = {
      ...baseLessonOneOff,
      id: '3',
      date: '2026-04-06', // Monday
    };
    const monday = new Date(2026, 3, 6);
    const result = getLessonsForDay(monday, [baseLessonRecurring, mondayOneOff]);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for days with no lessons', () => {
    const tuesday = new Date(2026, 3, 7); // Tuesday
    const result = getLessonsForDay(tuesday, [baseLessonRecurring, baseLessonOneOff]);
    expect(result).toHaveLength(0);
  });

  it('does not match one-off lessons on different dates with same weekday', () => {
    const otherFriday = new Date(2026, 3, 17); // Another Friday
    const result = getLessonsForDay(otherFriday, [baseLessonOneOff]);
    expect(result).toHaveLength(0);
  });
});
