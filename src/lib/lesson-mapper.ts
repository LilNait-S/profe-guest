import type { Lesson } from '@/types';

interface DbLesson {
  id: string;
  alumno_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  recurrente: boolean;
  fecha: string | null;
  created_at: string;
}

export function mapLessonFromDb(row: DbLesson): Lesson {
  return {
    id: row.id,
    student_id: row.alumno_id,
    day_of_week: row.dia_semana,
    start_time: row.hora_inicio,
    end_time: row.hora_fin,
    recurring: row.recurrente,
    date: row.fecha,
    created_at: row.created_at,
  };
}

export function mapLessonToDb(
  dto: Record<string, unknown>,
): Record<string, unknown> {
  const map: Record<string, string> = {
    student_id: 'alumno_id',
    day_of_week: 'dia_semana',
    start_time: 'hora_inicio',
    end_time: 'hora_fin',
    recurring: 'recurrente',
    date: 'fecha',
  };

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    const dbKey = map[key] ?? key;
    result[dbKey] = value;
  }
  return result;
}
