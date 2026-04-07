import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const studentId = req.nextUrl.searchParams.get('studentId');

  const { data: myStudents } = await auth.supabase
    .from('student')
    .select('id')
    .eq('teacher_id', auth.user.id)
    .eq('active', true);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('lesson')
    .select('*')
    .in('student_id', studentIds)
    .order('day_of_week')
    .order('start_time');

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  // Verify student ownership
  const { data: owner } = await auth.supabase
    .from('student')
    .select('id')
    .eq('id', body.student_id)
    .eq('teacher_id', auth.user.id)
    .single();

  if (!owner) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Multi-day schedule: days_of_week is an array
  const daysOfWeek: number[] = body.days_of_week ?? [body.day_of_week];
  const recurring = body.recurring ?? true;
  const scheduleGroupId =
    daysOfWeek.length > 1 ? crypto.randomUUID() : null;

  const rows = daysOfWeek.map((dow: number) => ({
    student_id: body.student_id,
    day_of_week: dow,
    start_time: body.start_time,
    end_time: body.end_time,
    recurring,
    date: recurring ? null : (body.date ?? null),
    start_date: body.start_date ?? null,
    end_date: body.end_date ?? null,
    schedule_group_id: scheduleGroupId,
    subject: body.subject ?? null,
  }));

  const { data, error } = await auth.supabase
    .from('lesson')
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
