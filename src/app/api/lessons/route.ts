import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';
import { mapLessonFromDb, mapLessonToDb } from '@/lib/lesson-mapper';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const studentId = req.nextUrl.searchParams.get('studentId');

  const { data: myStudents } = await auth.supabase
    .from('alumno')
    .select('id')
    .eq('profesor_id', auth.user.id)
    .eq('activo', true);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('clase')
    .select('*')
    .in('alumno_id', studentIds)
    .order('dia_semana')
    .order('hora_inicio');

  if (studentId) {
    query = query.eq('alumno_id', studentId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapLessonFromDb));
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  const { data: owner } = await auth.supabase
    .from('alumno')
    .select('id')
    .eq('id', body.student_id)
    .eq('profesor_id', auth.user.id)
    .single();

  if (!owner) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const dbData = mapLessonToDb({
    student_id: body.student_id,
    day_of_week: body.day_of_week,
    start_time: body.start_time,
    end_time: body.end_time,
    recurring: body.recurring ?? true,
    date: body.date ?? null,
  });

  const { data, error } = await auth.supabase
    .from('clase')
    .insert(dbData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapLessonFromDb(data), { status: 201 });
}
