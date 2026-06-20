import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('commission_requests')
    .select('*, fabric:fabric_choice_id(*), designer:seller_profiles!designer_id(storefront_name, storefront_slug, bio), customer:profiles!customer_id(full_name, avatar_url), measurements:customer_measurements(*), appointments:measurement_appointments(*), messages:commission_messages(*, sender:profiles!sender_id(full_name, avatar_url))')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isParticipant = data.customer_id === user.id || data.designer_id === user.id
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const allowedFields = ['status', 'quoted_price', 'deposit_amount', 'deposit_percentage', 'estimated_completion_date', 'customer_notes', 'fabric_choice_id', 'garment_category']

  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field]
  }
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('commission_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.status) {
    const statusLabels: Record<string, string> = {
      quoted: 'Quote Ready',
      deposit_paid: 'Deposit Confirmed',
      in_production: 'In Production',
      fitting_scheduled: 'Fitting Scheduled',
      ready: 'Ready for Delivery',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    const notificationType: Record<string, string> = {
      quoted: 'commission_quote',
      deposit_paid: 'commission_deposit_confirmed',
      in_production: 'commission_status_update',
      fitting_scheduled: 'commission_status_update',
      ready: 'commission_status_update',
      completed: 'commission_status_update',
      cancelled: 'commission_status_update',
    }

    if (data.designer_id === user.id) {
      await supabase.from('notifications').insert({
        user_id: data.customer_id,
        type: notificationType[body.status] || 'commission_status_update',
        title: `Commission ${statusLabels[body.status] || body.status}`,
        message: `Your commission request has been updated to "${statusLabels[body.status] || body.status}".`,
        link: `/dashboard/commissions/${id}`,
      })
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from('commission_requests')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('customer_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
