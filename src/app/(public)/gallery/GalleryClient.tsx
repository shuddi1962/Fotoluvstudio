'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import MasonryGrid from '@/components/gallery/MasonryGrid'
import Spinner from '@/components/ui/Spinner'
import type { Media } from '@/types/database'

export default function GalleryClient() {
  const [photos, setPhotos] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    let query = supabase
      .from('media')
      .select('*')
      .eq('context', 'public_gallery')
      .eq('media_type', 'photo')
      .order('created_at', { ascending: false })
      .limit(50)

    if (search) {
      query = query.contains('tags', [search])
    }

    const { data } = await query
    setPhotos(data || [])
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPhotos()}
          className="input max-w-md"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <MasonryGrid items={photos} />
      )}
    </div>
  )
}
