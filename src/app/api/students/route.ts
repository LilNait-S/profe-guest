import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { data, error } = await auth.supabase
    .from('alumno')
    .select('*')
    .eq('profesor_id', auth.user.id)
    .eq('activo', true)
    .order('nombre');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  const { data, error } = await auth.supabase
    .from('alumno')
    .insert({
      profesor_id: auth.user.id,
      nombre: body.name,
      contacto: body.contact ?? null,
      notas: body.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
