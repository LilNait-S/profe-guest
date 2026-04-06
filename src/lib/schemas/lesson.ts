import { z } from 'zod';

export const createLessonSchema = z
  .object({
    student_id: z.string().min(1, 'Selecciona un alumno'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
    recurring: z.boolean().default(true),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['end_time'],
  });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
