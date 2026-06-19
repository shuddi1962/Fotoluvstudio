'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import PhotoView from '@/components/gallery/PhotoView'
import Spinner from '@/components/ui/Spinner'
import type { Media } from '@/types/database'

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [media, setMedia] = useState<Media | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').eq('id', id).single()
      .then(({ data }) => { setMedia(data); setLoading(false) })
  }, [id])

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!media) return <PublicLayout><div className="text-center py-16 text-text-muted">Photo not found.</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoView media={media} showShopCTA={media.context === 'public_gallery'} />
      </div>
    </PublicLayout>
  )
}
