import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: commission } = await supabase
    .from('commission_requests')
    .select('customer_id, designer_id')
    .eq('id', body.commission_request_id)
    .single()

  if (!commission) return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
  if (commission.customer_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('measurement_appointments')
    .insert({
      commission_request_id: body.commission_request_id,
      designer_id: commission.designer_id,
      scheduled_for: body.scheduled_for,
      location: body.location || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase
    .from('commission_requests')
    .update({ status: 'fitting_scheduled', updated_at: new Date().toISOString() })
    .eq('id', body.commission_request_id)

  await supabase.from('notifications').insert({
    user_id: commission.designer_id,
    type: 'commission_appointment_reminder',
    title: 'Fitting Appointment Booked',
    message: 'A customer has booked an in-person measurement appointment.',
    link: `/seller/commissions/${body.commission_request_id}`,
  })

  return NextResponse.json(data)
}
