import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('commission_requests')
    .insert({
      customer_id: user.id,
      designer_id: body.designer_id,
      source_type: body.source_type,
      source_media_id: body.source_media_id || null,
      inspiration_media_ids: body.inspiration_media_ids || [],
      garment_category: body.garment_category || null,
      fabric_choice_id: body.fabric_choice_id || null,
      customer_notes: body.customer_notes || null,
      deposit_percentage: body.deposit_percentage || 50,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify designer
  await supabase.from('notifications').insert({
    user_id: body.designer_id,
    type: 'commission_request',
    title: 'New Commission Request',
    message: 'A customer has submitted a new bespoke commission request.',
    link: `/seller/commissions/${data.id}`,
  })

  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')

  let query = supabase.from('commission_requests').select('*, fabric:fabric_choice_id(*), designer:seller_profiles!designer_id(storefront_name, storefront_slug), customer:profiles!customer_id(full_name, avatar_url)')

  if (role === 'designer') {
    query = query.eq('designer_id', user.id)
  } else {
    query = query.eq('customer_id', user.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
