import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { data, error } = await auth.supabase
    .from('student')
    .select('*')
    .eq('teacher_id', auth.user.id)
    .eq('active', true)
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  const { data, error } = await auth.supabase
    .from('student')
    .insert({
      teacher_id: auth.user.id,
      name: body.name,
      monthly_rate: body.monthly_rate ?? 0,
      phone: body.phone ?? null,
      email: body.email ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
