'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/schemas/auth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
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
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                autoComplete="name"
                className="h-11"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className="h-11"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

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
