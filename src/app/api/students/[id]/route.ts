import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;

  const { data, error } = await auth.supabase
    .from('student')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', auth.user.id)
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await auth.supabase
    .from('student')
    .update(body)
    .eq('id', id)
    .eq('teacher_id', auth.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;

  const { error } = await auth.supabase
    .from('student')
    .update({ active: false })
    .eq('id', id)
    .eq('teacher_id', auth.user.id);

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
