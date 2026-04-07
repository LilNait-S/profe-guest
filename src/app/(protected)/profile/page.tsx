'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LogOut, Pencil, User, Plus, X, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SUBJECT_COLORS, DEFAULT_SUBJECT_COLOR } from '@/lib/subject-colors';

import { useTeacher, useUpdateTeacher } from '@/services/teacher';
import {
  updateTeacherSchema,
  type UpdateTeacherInput,
} from '@/lib/schemas/teacher';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import type { PaymentMethod, Subject } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { data: teacher, isLoading } = useTeacher();
  const updateTeacher = useUpdateTeacher();
  const { setTheme, resolvedTheme } = useTheme();
  const [editing, setEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<UpdateTeacherInput>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: { name: '', email: '' },
    values: teacher
      ? { name: teacher.name, email: teacher.email }
      : { name: '', email: '' },
  });

  const onSubmit = (data: UpdateTeacherInput) => {
    updateTeacher.mutate(data, {
      onSuccess: (updated) => {
        toast.success('Perfil actualizado');
        reset({ name: updated.name, email: updated.email });
        setEditing(false);
      },
      onError: () => {
        toast.error('No se pudo actualizar el perfil');
      },
    });
  };

  const handleCancelEdit = () => {
    reset(
      teacher
        ? { name: teacher.name, email: teacher.email }
        : { name: '', email: '' },
    );
    setEditing(false);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Payment methods management
  const paymentMethods: PaymentMethod[] = teacher?.payment_methods ?? [{ name: 'Efectivo', surcharge: 0 }];
  const [editingMethods, setEditingMethods] = useState(false);
  const [draftMethods, setDraftMethods] = useState<PaymentMethod[]>([]);

  const startEditingMethods = () => {
    setDraftMethods([...paymentMethods]);
    setEditingMethods(true);
  };

  const cancelEditingMethods = () => {
    setEditingMethods(false);
    setDraftMethods([]);
  };

  const saveEditingMethods = () => {
    const cleaned = draftMethods.filter((m) => m.name.trim());
    if (cleaned.length === 0) return;
    updateTeacher.mutate(
      { payment_methods: cleaned },
      {
        onSuccess: () => {
          toast.success('Medios de pago actualizados');
          setEditingMethods(false);
        },
      },
    );
  };

  const handleAddDraft = () => {
    setDraftMethods([...draftMethods, { name: '', surcharge: 0 }]);
  };

  const handleUpdateDraft = (index: number, field: keyof PaymentMethod, value: string | number) => {
    setDraftMethods(draftMethods.map((m, i) =>
      i === index ? { ...m, [field]: value } : m,
    ));
  };

  const handleRemoveDraft = (index: number) => {
    if (draftMethods.length <= 1) return;
    setDraftMethods(draftMethods.filter((_, i) => i !== index));
  };

  // Subjects management
  const subjects: Subject[] = teacher?.subjects ?? [];
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [draftSubjects, setDraftSubjects] = useState<Subject[]>([]);

  const startEditingSubjects = () => {
    setDraftSubjects([...subjects]);
    setEditingSubjects(true);
  };

  const saveEditingSubjects = () => {
    const cleaned = draftSubjects.filter((s) => s.name.trim());
    updateTeacher.mutate(
      { subjects: cleaned },
      {
        onSuccess: () => {
          toast.success('Materias actualizadas');
          setEditingSubjects(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Avatar + info + edit toggle */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <User className="size-10 text-primary" />
        </div>

        {editing ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full max-w-xs flex-col gap-3"
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
                    className="h-11"
                    autoFocus
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    className="h-11"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10"
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10"
                disabled={updateTeacher.isPending}
              >
                {updateTeacher.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {teacher?.name}
              </h1>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditing(true)}
                aria-label="Editar perfil"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{teacher?.email}</p>
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Payment methods */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Medios de pago
          </h2>
          {!editingMethods && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={startEditingMethods}
              aria-label="Editar medios de pago"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>

        {editingMethods ? (
          <div className="flex flex-col gap-2">
            {draftMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <Input
                  value={method.name}
                  onChange={(e) => handleUpdateDraft(index, 'name', e.target.value)}
                  placeholder="Nombre"
                  className="h-10 flex-1 text-sm"
                  autoFocus={index === draftMethods.length - 1}
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">+S/</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={method.surcharge}
                    onChange={(e) => handleUpdateDraft(index, 'surcharge', Number(e.target.value) || 0)}
                    className="h-10 w-16 text-sm"
                  />
                </div>
                {draftMethods.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveDraft(index)}
                    aria-label="Eliminar medio"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="ghost"
              className="h-10 justify-start text-muted-foreground"
              onClick={handleAddDraft}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Agregar medio
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={cancelEditingMethods}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-10"
                onClick={saveEditingMethods}
                disabled={updateTeacher.isPending}
              >
                {updateTeacher.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-foreground">{method.name}</span>
                {method.surcharge > 0 && (
                  <span className="text-xs text-muted-foreground">+S/{method.surcharge}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Subjects */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Materias
          </h2>
          {!editingSubjects && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={startEditingSubjects}
              aria-label="Editar materias"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>

        {editingSubjects ? (
          <div className="flex flex-col gap-2">
            {draftSubjects.map((sub, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-lg bg-muted/30 p-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: sub.color || DEFAULT_SUBJECT_COLOR }}
                  />
                  <Input
                    value={sub.name}
                    onChange={(e) =>
                      setDraftSubjects(draftSubjects.map((s, i) =>
                        i === index ? { ...s, name: e.target.value } : s,
                      ))
                    }
                    placeholder="Nombre de la materia"
                    className="h-9 flex-1 text-sm"
                    autoFocus={index === draftSubjects.length - 1}
                  />
                  {draftSubjects.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDraftSubjects(draftSubjects.filter((_, i) => i !== index))}
                    >
                      <X className="size-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-1.5 pl-6">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className="flex size-6 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c.value }}
                      onClick={() =>
                        setDraftSubjects(draftSubjects.map((s, i) =>
                          i === index ? { ...s, color: c.value } : s,
                        ))
                      }
                    >
                      {sub.color === c.value && (
                        <Check className="size-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Button
              variant="ghost"
              className="h-10 justify-start text-muted-foreground"
              onClick={() => setDraftSubjects([...draftSubjects, { name: '', color: DEFAULT_SUBJECT_COLOR }])}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Agregar materia
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => setEditingSubjects(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-10"
                onClick={saveEditingSubjects}
                disabled={updateTeacher.isPending}
              >
                {updateTeacher.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin materias configuradas.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {subjects.map((sub, index) => (
              <div key={index} className="flex items-center gap-2 py-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: sub.color || DEFAULT_SUBJECT_COLOR }}
                />
                <span className="text-sm text-foreground">{sub.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Settings */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Ajustes
        </h2>

        <Button
          variant="ghost"
          className="h-11 justify-between"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          <span className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </Button>

        <Button
          variant="ghost"
          className="h-11 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" data-icon="inline-start" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
