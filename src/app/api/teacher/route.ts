import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseForUser, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const { data, error } = await auth.supabase
    .from('teacher')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await getSupabaseForUser(req);
  if (!auth) return unauthorized();

  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.name) updateData.name = body.name;
  if (body.email) updateData.email = body.email;
  if (body.payment_methods) updateData.payment_methods = body.payment_methods;
  if (body.subjects) updateData.subjects = body.subjects;

  // Update teacher table
  const { data, error } = await auth.supabase
    .from('teacher')
    .update(updateData)
    .eq('id', auth.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If email changed, also update Supabase Auth
  if (body.email && body.email !== auth.user.email) {
    const { error: authError } = await auth.supabase.auth.updateUser({
      email: body.email,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
  }

  return NextResponse.json(data);
}
