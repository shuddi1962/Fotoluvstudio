import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: commission } = await supabase
    .from('commission_requests')
    .select('*')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single()

  if (!commission) return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
  if (commission.status !== 'quoted') return NextResponse.json({ error: 'Commission is not in quoted status' }, { status: 400 })

  const body = await request.json()
  const depositAmount = body.amount || (commission.quoted_price && commission.deposit_percentage
    ? (commission.quoted_price * commission.deposit_percentage / 100)
    : 0)

  const { error } = await supabase
    .from('commission_requests')
    .update({
      status: 'deposit_paid',
      deposit_amount: depositAmount,
      deposit_paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('notifications').insert({
    user_id: commission.designer_id,
    type: 'commission_deposit_confirmed',
    title: 'Deposit Paid',
    message: 'A customer has paid the deposit for their commission.',
    link: `/seller/commissions/${id}`,
  })

  return NextResponse.json({ success: true, deposit_amount: depositAmount })
}
