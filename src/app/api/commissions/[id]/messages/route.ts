import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('commission_messages')
    .select('*, sender:profiles!sender_id(full_name, avatar_url)')
    .eq('commission_request_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const { data: commission } = await supabase
    .from('commission_requests')
    .select('customer_id, designer_id')
    .eq('id', id)
    .single()

  if (!commission) return NextResponse.json({ error: 'Commission not found' }, { status: 404 })

  const isParticipant = commission.customer_id === user.id || commission.designer_id === user.id
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('commission_messages')
    .insert({
      commission_request_id: id,
      sender_id: user.id,
      message: body.message,
      attachment_url: body.attachment_url || null,
    })
    .select('*, sender:profiles!sender_id(full_name, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the other participant
  const notifyUserId = commission.customer_id === user.id ? commission.designer_id : commission.customer_id
  await supabase.from('notifications').insert({
    user_id: notifyUserId,
    type: 'commission_message',
    title: 'New Message',
    message: 'You have a new message regarding a commission.',
    link: `/seller/commissions/${id}`,
  })

  return NextResponse.json(data)
}
