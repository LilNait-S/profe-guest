import { describe, it, expect } from 'vitest';
import { mapLessonFromDb, mapLessonToDb } from './lesson-mapper';

describe('mapLessonFromDb', () => {
  it('maps Spanish DB columns to English TS fields', () => {
    const dbRow = {
      id: 'abc-123',
      alumno_id: 'student-1',
      dia_semana: 2,
      hora_inicio: '09:00',
      hora_fin: '10:00',
      recurrente: true,
      fecha: null,
      created_at: '2026-01-01T00:00:00Z',
    };

    const result = mapLessonFromDb(dbRow);

    expect(result).toEqual({
      id: 'abc-123',
      student_id: 'student-1',
      day_of_week: 2,
      start_time: '09:00',
      end_time: '10:00',
      recurring: true,
      date: null,
      created_at: '2026-01-01T00:00:00Z',
    });
  });

  it('maps one-off lesson with fecha', () => {
    const dbRow = {
      id: 'def-456',
      alumno_id: 'student-2',
      dia_semana: 4,
      hora_inicio: '14:00',
      hora_fin: '15:00',
      recurrente: false,
      fecha: '2026-04-10',
      created_at: '2026-01-01T00:00:00Z',
    };

    const result = mapLessonFromDb(dbRow);

    expect(result.date).toBe('2026-04-10');
    expect(result.recurring).toBe(false);
  });
});

describe('mapLessonToDb', () => {
  it('maps English TS fields to Spanish DB columns', () => {
    const dto = {
      student_id: 'student-1',
      day_of_week: 0,
      start_time: '09:00',
      end_time: '10:00',
      recurring: true,
      date: null,
    };

    const result = mapLessonToDb(dto);

    expect(result).toEqual({
      alumno_id: 'student-1',
      dia_semana: 0,
      hora_inicio: '09:00',
      hora_fin: '10:00',
      recurrente: true,
      fecha: null,
    });
  });

  it('handles partial updates (only some fields)', () => {
    const dto = {
      day_of_week: 3,
      start_time: '11:00',
    };

    const result = mapLessonToDb(dto);

    expect(result).toEqual({
      dia_semana: 3,
      hora_inicio: '11:00',
    });
  });

  it('passes through unknown keys unchanged', () => {
    const dto = { id: 'abc-123' };
    const result = mapLessonToDb(dto);
    expect(result).toEqual({ id: 'abc-123' });
  });
});
