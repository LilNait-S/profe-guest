import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  // Get teacher's student IDs
  const { data: myStudents } = await auth.supabase
    .from('student')
    .select('id')
    .eq('teacher_id', auth.user.id);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  // Get lesson IDs for teacher's students
  const { data: myLessons } = await auth.supabase
    .from('lesson')
    .select('id')
    .in('student_id', studentIds);

  const lessonIds = myLessons?.map((l) => l.id) ?? [];
  if (lessonIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('lesson_exception')
    .select('*')
    .in('lesson_id', lessonIds);

  if (from) query = query.gte('exception_date', from);
  if (to) query = query.lte('exception_date', to);

  const { data, error } = await query.order('exception_date');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  // Verify teacher owns the lesson via student
  const { data: lesson } = await auth.supabase
    .from('lesson')
    .select('id, student_id')
    .eq('id', body.lesson_id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
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

  const { data, error } = await auth.supabase
    .from('lesson_exception')
    .insert({
      lesson_id: body.lesson_id,
      exception_date: body.exception_date,
      type: body.type ?? 'cancelled',
      reason: body.reason ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
