'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Media } from '@/types/database'

export default function AdminModerationsPage() {
  const [pending, setPending] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').eq('context', 'seller_design').order('created_at', { ascending: false })
      .then(({ data }) => { setPending(data || []); setLoading(false) })
  }, [])

  const approveMedia = async (id: string) => {
    await supabase.from('media').update({ context: 'public_gallery' }).eq('id', id)
    setPending(pending.filter(m => m.id !== id))
  }

  const rejectMedia = async (id: string) => {
    await supabase.from('media').delete().eq('id', id)
    setPending(pending.filter(m => m.id !== id))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Moderation Queue</h1>
      {pending.length === 0 ? (
        <EmptyState title="Queue is clear" description="No content pending review." />
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title || 'Untitled'}</p>
                  <p className="text-sm text-text-muted">{item.storage_path_original}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => approveMedia(item.id)}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectMedia(item.id)}>Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
