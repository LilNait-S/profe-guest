import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

async function getTeacherStudentIds(auth: NonNullable<Awaited<ReturnType<typeof getSupabaseForUser>>>) {
  const { data } = await auth.supabase
    .from('student')
    .select('id')
    .eq('teacher_id', auth.user.id);
  return data?.map((s) => s.id) ?? [];
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const studentIds = await getTeacherStudentIds(auth);

  if (studentIds.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from('lesson')
    .update(body)
    .eq('id', id)
    .in('student_id', studentIds)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const studentIds = await getTeacherStudentIds(auth);

  if (studentIds.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await auth.supabase
    .from('lesson')
    .delete()
    .eq('id', id)
    .in('student_id', studentIds);

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
