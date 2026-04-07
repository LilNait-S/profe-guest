import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema;

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
