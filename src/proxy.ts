import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup');

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
