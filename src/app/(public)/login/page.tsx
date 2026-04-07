'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function LoginPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const fillDemo = () => {
    setValue('email', 'testing@gmail.com');
    setValue('password', 'demo123');
  };

  const onSubmit = async (data: LoginInput) => {
    const supabase = getSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      const message = getLoginErrorMessage(authError.message);
      toast.error(message);
      return;
    }

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
            Schedule App
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu agenda de clases, simple.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="••••••"
                    autoComplete="current-password"
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
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 text-muted-foreground"
              onClick={fillDemo}
            >
              Probar con cuenta demo
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Crear cuenta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

function getLoginErrorMessage(supabaseMessage: string): string {
  if (supabaseMessage.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos';
  }
  if (supabaseMessage.includes('Email not confirmed')) {
    return 'Confirma tu email antes de iniciar sesión';
  }
  if (supabaseMessage.includes('Too many requests')) {
    return 'Demasiados intentos. Espera un momento';
  }
  return 'No se pudo iniciar sesión. Intenta de nuevo';
}
