import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const studentIds = (
    await auth.supabase
      .from('alumno')
      .select('id')
      .eq('profesor_id', auth.user.id)
  ).data?.map((s) => s.id) ?? [];

  if (studentIds.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.paid !== undefined) {
    updateData.pagado = body.paid;
    updateData.fecha_pago = body.paid ? new Date().toISOString().split('T')[0] : null;
  }
  if (body.amount !== undefined) updateData.monto = body.amount;

  const { data, error } = await auth.supabase
    .from('pago')
    .update(updateData)
    .eq('id', id)
    .in('alumno_id', studentIds)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
