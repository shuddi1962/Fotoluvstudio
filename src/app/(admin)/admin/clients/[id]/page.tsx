'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import type { Profile, Event } from '@/types/database'

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('events').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ]).then(([profileRes, eventsRes]) => {
      setProfile(profileRes.data)
      setEvents(eventsRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-headline">{profile?.full_name || 'Client'}</h1>
        <div className="flex items-center gap-2 mt-2">
          {profile?.is_gold_member && <Badge variant="gold">Gold Member</Badge>}
          <Badge>{profile?.role}</Badge>
        </div>
      </div>
      <h2 className="text-xl font-headline mb-4">Events ({events.length})</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                {event.event_date && <p className="text-sm text-text-muted">{new Date(event.event_date).toLocaleDateString()}</p>}
              </div>
              <Badge variant={event.is_published ? 'success' : 'warning'}>{event.is_published ? 'Published' : 'Draft'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
