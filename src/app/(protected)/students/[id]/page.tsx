'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStudent, useUpdateStudent, useDeleteStudent } from '@/services/students';
import { updateStudentSchema, type UpdateStudentInput } from '@/lib/schemas/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent(id);
  const deleteStudent = useDeleteStudent(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: { name: '', contact: '', notes: '' },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        contact: student.contact ?? '',
        notes: student.notes ?? '',
      });
    }
  }, [student, reset]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Alumno no encontrado</p>
      </div>
    );
  }

  const onSubmit = (data: UpdateStudentInput) => {
    updateStudent.mutate(
      { name: data.name, contact: data.contact || undefined, notes: data.notes || undefined },
      { onSuccess: () => router.push('/students') },
    );
  };

  const handleDelete = () => {
    if (confirm('¿Dar de baja a este alumno?')) {
      deleteStudent.mutate(undefined, {
        onSuccess: () => router.push('/students'),
      });
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Editar alumno</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contacto</Label>
          <Input id="contact" {...register('contact')} />
          {errors.contact && (
            <p className="text-sm text-destructive">{errors.contact.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" rows={3} {...register('notes')} />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={updateStudent.isPending}>
          {updateStudent.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>

      <Button
        variant="outline"
        className="mt-4 w-full border-red-300 text-red-600 hover:bg-red-50"
        onClick={handleDelete}
      >
        Dar de baja
      </Button>
    </div>
  );
}
