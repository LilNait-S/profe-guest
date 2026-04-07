import { z } from 'zod';

export const updateTeacherSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
});

export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
