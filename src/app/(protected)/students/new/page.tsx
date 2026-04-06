'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStudentSchema, type CreateStudentInput } from '@/lib/schemas/student';
import { useCreateStudent } from '@/services/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
  });

  const onSubmit = (data: CreateStudentInput) => {
    createStudent.mutate(
      {
        name: data.name,
        contact: data.contact || undefined,
        notes: data.notes || undefined,
      },
      { onSuccess: () => router.push('/students') },
    );
  };

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Nuevo alumno</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contact">Contacto</Label>
          <Input
            id="contact"
            placeholder="Tel o WhatsApp"
            {...register('contact')}
          />
          {errors.contact && (
            <p className="mt-1 text-sm text-destructive">{errors.contact.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" rows={3} {...register('notes')} />
          {errors.notes && (
            <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={createStudent.isPending}
          className="w-full"
        >
          {createStudent.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </div>
  );
}
