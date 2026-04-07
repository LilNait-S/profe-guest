'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/schemas/auth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function SignupPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupInput) => {
    const supabase = getSupabaseClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    });

    if (authError) {
      const message = getSignupErrorMessage(authError.message);
      toast.error(message);
      return;
    }

    toast.success('Cuenta creada correctamente');
    router.push('/');
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl text-foreground">
            ProfeGest
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea tu cuenta
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    className="h-11"
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
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="h-11"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className="h-11"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

function getSignupErrorMessage(supabaseMessage: string): string {
  if (supabaseMessage.includes('User already registered')) {
    return 'Este email ya tiene una cuenta. Intenta iniciar sesión';
  }
  if (supabaseMessage.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (supabaseMessage.includes('Unable to validate email')) {
    return 'El email ingresado no es válido';
  }
  if (supabaseMessage.includes('Too many requests')) {
    return 'Demasiados intentos. Espera un momento';
  }
  return 'No se pudo crear la cuenta. Intenta de nuevo';
}
