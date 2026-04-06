'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

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
            ProfeGest
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu agenda de clases, simple.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••"
                autoComplete="current-password"
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
              {isSubmitting ? 'Entrando...' : 'Entrar'}
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
