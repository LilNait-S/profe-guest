import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;

  // Verify teacher owns the exception via lesson -> student -> teacher
  const { data: exception } = await auth.supabase
    .from('lesson_exception')
    .select('id, lesson_id')
    .eq('id', id)
    .single();

  if (!exception) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: lesson } = await auth.supabase
    .from('lesson')
    .select('student_id')
    .eq('id', exception.lesson_id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: student } = await auth.supabase
    .from('student')
    .select('id')
    .eq('id', lesson.student_id)
    .eq('teacher_id', auth.user.id)
    .single();

  if (!student) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { error } = await auth.supabase
    .from('lesson_exception')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
