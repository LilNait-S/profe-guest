import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from './supabase/server';

export async function getAuthUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export async function getSupabaseForUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) return null;

  return { supabase, user };
}
