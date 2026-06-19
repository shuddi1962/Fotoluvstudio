'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import MasonryGrid from '@/components/gallery/MasonryGrid'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import type { Event, Media } from '@/types/database'

export default function EventGalleryPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [isGoldMember, setIsGoldMember] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    setEvent(eventData)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_gold_member')
        .eq('id', user.id)
        .single()
      setIsGoldMember(profile?.is_gold_member || false)
    }

    const { data: mediaData } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true })

    setMedia(mediaData || [])
    setLoading(false)
  }

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline">{event?.title || 'Event Gallery'}</h1>
            {event?.event_date && (
              <p className="text-text-muted">{new Date(event.event_date).toLocaleDateString()}</p>
            )}
          </div>
          {isGoldMember && <Badge variant="gold">Gold Member — Full Resolution</Badge>}
        </div>
        <MasonryGrid items={media} />
      </div>
    </PublicLayout>
  )
}
