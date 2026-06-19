'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { Media } from '@/types/database'

export default function AdminCurationPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').eq('context', 'public_gallery').order('created_at', { ascending: false })
      .then(({ data }) => { setMedia(data || []); setLoading(false) })
  }, [])

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('media').update({ is_featured: !current }).eq('id', id)
    setMedia(media.map(m => m.id === id ? { ...m, is_featured: !current } : m))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Curation</h1>
      <div className="space-y-4">
        {media.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.title || 'Untitled'}</p>
                <p className="text-sm text-text-muted">{item.tags?.join(', ') || 'No tags'}</p>
              </div>
              <Button variant={item.is_featured ? 'primary' : 'ghost'} onClick={() => toggleFeatured(item.id, item.is_featured)}>
                {item.is_featured ? 'Featured' : 'Mark as Featured'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
