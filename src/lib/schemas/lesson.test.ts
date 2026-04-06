import { describe, it, expect } from 'vitest';
import { createLessonSchema } from './lesson';

describe('createLessonSchema', () => {
  it('validates a correct recurring lesson', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '09:00',
      end_time: '10:00',
      recurring: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates a correct one-off lesson', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '14:00',
      end_time: '15:30',
      recurring: false,
    });
    expect(result.success).toBe(true);
  });

  it('defaults recurring to true', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '09:00',
      end_time: '10:00',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recurring).toBe(true);
    }
  });

  it('rejects empty student_id', () => {
    const result = createLessonSchema.safeParse({
      student_id: '',
      start_time: '09:00',
      end_time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid time format', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '9am',
      end_time: '10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects end_time before start_time', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '10:00',
      end_time: '09:00',
      recurring: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects equal start and end time', () => {
    const result = createLessonSchema.safeParse({
      student_id: 'student-1',
      start_time: '09:00',
      end_time: '09:00',
      recurring: true,
    });
    expect(result.success).toBe(false);
  });
});
