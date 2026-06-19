'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { BookingInquiry } from '@/types/database'

export default function AdminBookingInquiriesPage() {
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('booking_inquiries').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setInquiries(data || []); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('booking_inquiries').update({ status }).eq('id', id)
    setInquiries(inquiries.map(i => i.id === id ? { ...i, status: status as any } : i))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  const getBadgeVariant = (s: string) => s === 'new' ? 'warning' : s === 'contacted' ? 'gold' : s === 'closed' ? 'success' : 'default'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Booking Inquiries</h1>
      {inquiries.length === 0 ? (
        <EmptyState title="No inquiries yet" description="When visitors submit the booking form, leads will appear here." />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{inq.name}</p>
                    <Badge variant={getBadgeVariant(inq.status)}>{inq.status}</Badge>
                  </div>
                  <p className="text-sm text-text-muted">{inq.email}</p>
                  {inq.event_type && <p className="text-sm mt-1">Event: {inq.event_type}</p>}
                  {inq.message && <p className="text-sm text-text-muted mt-2">{inq.message}</p>}
                  <p className="text-xs text-text-muted mt-2">{new Date(inq.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {inq.status === 'new' && <Button size="sm" variant="secondary" onClick={() => updateStatus(inq.id, 'contacted')}>Mark Contacted</Button>}
                  {inq.status !== 'closed' && <Button size="sm" variant="ghost" onClick={() => updateStatus(inq.id, 'closed')}>Close</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
