import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type SignupInput = z.infer<typeof signupSchema>;
