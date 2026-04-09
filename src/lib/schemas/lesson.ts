import { z } from 'zod';

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const scheduleTypeEnum = z.enum(['monthly', 'one_off']);
export type ScheduleType = z.infer<typeof scheduleTypeEnum>;

export const createScheduleSchema = z
  .object({
    student_id: z.string().min(1, 'Selecciona un alumno'),
    schedule_type: scheduleTypeEnum.default('monthly'),
    days_of_week: z.array(z.number().min(0).max(6)).default([]),
    start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
    end_time: z.string().regex(timeRegex, 'Formato HH:mm'),
    date: z.string().regex(dateRegex).nullable().default(null),
    subject: z.string().nullable().default(null),
    amount: z.number().min(0).default(0),
    paid: z.boolean().default(false),
    payment_method: z.string().nullable().default(null),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['end_time'],
  })
  .refine(
    (data) => data.days_of_week.length > 0,
    {
      message: 'Selecciona al menos un día',
      path: ['days_of_week'],
    },
  );

export type CreateScheduleInput = z.input<typeof createScheduleSchema>;
export type CreateScheduleOutput = z.output<typeof createScheduleSchema>;

export const createExceptionSchema = z.object({
  lesson_id: z.string().min(1),
  exception_date: z.string().regex(dateRegex, 'Formato YYYY-MM-DD'),
  type: z.literal('cancelled').default('cancelled'),
  reason: z.string().max(200).optional(),
});

export type CreateExceptionInput = z.infer<typeof createExceptionSchema>;
