'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  updateStudentSchema,
  type UpdateStudentInput,
} from '@/lib/schemas/student';
import { useUpdateStudent, useDeleteStudent } from '@/services/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { Student } from '@/types';

interface EditStudentSheetProps {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentSheet({
  student,
  onOpenChange,
}: EditStudentSheetProps) {
  const updateStudent = useUpdateStudent(student?.id ?? '');
  const deleteStudent = useDeleteStudent(student?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: { name: '', phone: '', email: '', notes: '' },
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        phone: student.phone ?? '',
        email: student.email ?? '',
        notes: student.notes ?? '',
      });
    }
  }, [student, reset]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: UpdateStudentInput) => {
    updateStudent.mutate(
      {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Alumno actualizado');
          handleClose();
        },
        onError: () => {
          toast.error('No se pudo actualizar el alumno');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm('¿Dar de baja a este alumno?')) return;

    deleteStudent.mutate(undefined, {
      onSuccess: () => {
        toast.success('Alumno dado de baja');
        handleClose();
      },
      onError: () => {
        toast.error('No se pudo dar de baja al alumno');
      },
    });
  };

  return (
    <Sheet
      open={student !== null}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Editar alumno</SheetTitle>
          <SheetDescription>
            Modifica los datos o da de baja al alumno.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 pb-4"
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Ej: María López"
                  className="h-11"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="flex gap-3">
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-1">
                  <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Ej: 912345678"
                    className="h-11"
                    type="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-1">
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Ej: ana@mail.com"
                    className="h-11"
                    type="email"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Notas (opcional)</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Instrumento, nivel, horario preferido..."
                  rows={2}
                />
              </Field>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={updateStudent.isPending}
            >
              {updateStudent.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

          <Button
            type="button"
            variant="destructive"
            className="h-11"
            disabled={deleteStudent.isPending}
            onClick={handleDelete}
          >
            {deleteStudent.isPending ? 'Eliminando...' : 'Dar de baja'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
