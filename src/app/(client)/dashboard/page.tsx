'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { Event } from '@/types/database'

export default function ClientDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [isGoldMember, setIsGoldMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_gold_member')
      .eq('id', user.id)
      .single()
    setIsGoldMember(profile?.is_gold_member || false)

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('client_id', user.id)
      .eq('is_published', true)
      .order('event_date', { ascending: false })

    setEvents(eventData || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline">My Dashboard</h1>
          <p className="text-text-muted">Welcome back to your event gallery.</p>
        </div>
        {!isGoldMember ? (
          <Link href="/pricing">
            <Button variant="gold">Upgrade to Gold</Button>
          </Link>
        ) : (
          <Badge variant="gold">Gold Member</Badge>
        )}
      </div>

      {isGoldMember && (
        <Card className="mb-8 bg-gold-bg border-gold/30">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gold shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <p className="font-semibold text-gold-dark">Gold Member</p>
              <p className="text-sm text-gold-dark/80">You have access to watermark-free full-resolution downloads.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/orders" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-headline font-semibold mb-1">My Orders</h3>
          <p className="text-sm text-text-muted">View your purchase history and order status.</p>
        </Link>
        <Link href="/dashboard/commissions" className="card p-5 hover:shadow-md transition-shadow border-2 border-accent/10">
          <h3 className="font-headline font-semibold mb-1">My Commissions</h3>
          <p className="text-sm text-text-muted">Track your bespoke design requests and their progress.</p>
          <span className="inline-block mt-2 text-xs text-accent font-medium">New: Commission custom pieces &rarr;</span>
        </Link>
      </div>

      <h2 className="text-xl font-headline mb-4">My Events</h2>
      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="When your photographer publishes new event galleries, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-[16/10] bg-gray-100" />
              <div className="p-4">
                <h3 className="font-headline font-semibold group-hover:text-accent transition-colors">{event.title}</h3>
                {event.event_date && (
                  <p className="text-sm text-text-muted mt-1">{new Date(event.event_date).toLocaleDateString()}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
