import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const month = req.nextUrl.searchParams.get('month');
  const year = req.nextUrl.searchParams.get('year');
  const studentId = req.nextUrl.searchParams.get('studentId');

  const { data: myStudents } = await auth.supabase
    .from('student')
    .select('id')
    .eq('teacher_id', auth.user.id);

  const studentIds = myStudents?.map((s) => s.id) ?? [];
  if (studentIds.length === 0) return NextResponse.json([]);

  let query = auth.supabase
    .from('payment')
    .select('*')
    .in('student_id', studentIds);

  if (studentId) query = query.eq('student_id', studentId);
  if (month) query = query.eq('month', Number(month));
  if (year) query = query.eq('year', Number(year));

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  const { data: owner } = await auth.supabase
    .from('student')
    .select('id')
    .eq('id', body.student_id)
    .eq('teacher_id', auth.user.id)
    .single();

  if (!owner) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from('payment')
    .insert({
      student_id: body.student_id,
      month: body.month,
      year: body.year,
      amount: body.amount,
      paid: true,
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: body.payment_method ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
