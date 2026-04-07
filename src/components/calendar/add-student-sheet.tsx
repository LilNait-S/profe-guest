'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  createStudentSchema,
  type CreateStudentInput,
} from '@/lib/schemas/student';
import { useCreateStudent } from '@/services/students';
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
  SheetTrigger,
} from '@/components/ui/sheet';

interface AddStudentSheetProps {
  /** Controlled mode: parent manages open/close */
  open?: boolean;
  /** Controlled mode: parent handles open/close */
  onOpenChange?: (open: boolean) => void;
  /** Called with the new student's id after successful creation */
  onCreated?: (studentId: string) => void;
  /** Optional custom trigger element. When provided, the Sheet manages its own open state via the trigger. */
  trigger?: React.ReactNode;
}

export function AddStudentSheet({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCreated,
  trigger,
}: AddStudentSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { mutate, isPending } = useCreateStudent();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(v);
    } else {
      setInternalOpen(v);
    }
  };

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { name: '', phone: '', email: '', notes: '' },
  });

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = (data: CreateStudentInput) => {
    mutate(data, {
      onSuccess: (student) => {
        toast.success('Alumno creado');
        reset();
        setOpen(false);
        onCreated?.(student.id);
      },
      onError: () => {
        toast.error('No se pudo crear el alumno');
      },
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        setOpen(v);
      }}
    >
      {trigger && <SheetTrigger render={trigger as React.JSX.Element} />}

      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Nuevo alumno</SheetTitle>
          <SheetDescription>
            Agrega un alumno rápidamente.
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
                  autoFocus
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
            <Button type="submit" className="flex-1 h-11" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Crear alumno'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
