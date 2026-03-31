import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const month = req.nextUrl.searchParams.get('month');
  const year = req.nextUrl.searchParams.get('year');
  const studentId = req.nextUrl.searchParams.get('studentId');

  const { data: myStudents } = await auth.supabase
    .from('alumno')
    .select('id')
    .eq('profesor_id', auth.user.id);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('pago')
    .select('*')
    .in('alumno_id', studentIds);

  if (studentId) query = query.eq('alumno_id', studentId);
  if (month) query = query.eq('mes', Number(month));
  if (year) query = query.eq('anio', Number(year));

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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

  const { data, error } = await auth.supabase
    .from('pago')
    .insert({
      alumno_id: body.student_id,
      mes: body.month,
      anio: body.year,
      monto: body.amount,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
