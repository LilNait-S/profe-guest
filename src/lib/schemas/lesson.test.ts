import { describe, it, expect } from 'vitest';
import { createScheduleSchema, createExceptionSchema } from './lesson';

describe('createScheduleSchema', () => {
  it('validates monthly schedule with multiple days', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'monthly',
      days_of_week: [0, 2],
      start_time: '14:00',
      end_time: '15:00',
    });
    expect(result.success).toBe(true);
  });

  it('validates one-off lesson', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'one_off',
      days_of_week: [],
      start_time: '10:00',
      end_time: '11:00',
      date: '2026-04-15',
    });
    expect(result.success).toBe(true);
  });

  it('defaults schedule_type to monthly', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      days_of_week: [3],
      start_time: '16:00',
      end_time: '17:00',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schedule_type).toBe('monthly');
    }
  });

  it('rejects monthly without days', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'monthly',
      days_of_week: [],
      start_time: '09:00',
      end_time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects one_off without date', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'one_off',
      days_of_week: [],
      start_time: '09:00',
      end_time: '10:00',
      date: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects end_time before start_time', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'monthly',
      days_of_week: [0],
      start_time: '15:00',
      end_time: '14:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty student_id', () => {
    const result = createScheduleSchema.safeParse({
      student_id: '',
      schedule_type: 'monthly',
      days_of_week: [0],
      start_time: '09:00',
      end_time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid day_of_week values', () => {
    const result = createScheduleSchema.safeParse({
      student_id: 'student-1',
      schedule_type: 'monthly',
      days_of_week: [7],
      start_time: '09:00',
      end_time: '10:00',
    });
    expect(result.success).toBe(false);
  });
});

describe('createExceptionSchema', () => {
  it('validates a cancellation', () => {
    const result = createExceptionSchema.safeParse({
      lesson_id: 'lesson-1',
      exception_date: '2026-04-13',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('cancelled');
    }
  });

  it('validates with optional reason', () => {
    const result = createExceptionSchema.safeParse({
      lesson_id: 'lesson-1',
      exception_date: '2026-04-13',
      reason: 'Feriado',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    const result = createExceptionSchema.safeParse({
      lesson_id: 'lesson-1',
      exception_date: '13-04-2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects reason over 200 chars', () => {
    const result = createExceptionSchema.safeParse({
      lesson_id: 'lesson-1',
      exception_date: '2026-04-13',
      reason: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
