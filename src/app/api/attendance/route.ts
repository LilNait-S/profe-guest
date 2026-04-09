import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  const { data: myStudents } = await auth.supabase
    .from('student')
    .select('id')
    .eq('teacher_id', auth.user.id);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  const { data: myLessons } = await auth.supabase
    .from('lesson')
    .select('id')
    .in('student_id', studentIds);

  const lessonIds = myLessons?.map((l) => l.id) ?? [];
  if (lessonIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('attendance')
    .select('*')
    .in('lesson_id', lessonIds);

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query.order('date');

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

  // If status is null, delete the record (unmarked)
  if (!body.status) {
    await auth.supabase
      .from('attendance')
      .delete()
      .eq('lesson_id', body.lesson_id)
      .eq('date', body.date);

    return NextResponse.json({ ok: true });
  }

  // Upsert: create or update attendance
  const { data, error } = await auth.supabase
    .from('attendance')
    .upsert(
      {
        lesson_id: body.lesson_id,
        date: body.date,
        status: body.status,
      },
      { onConflict: 'lesson_id,date' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
