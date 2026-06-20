'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import MediaLightbox from '@/components/lightbox/MediaLightbox'
import Spinner from '@/components/ui/Spinner'
import type { Media, Profile, SellerProfile } from '@/types/database'

interface LightboxMedia extends Media {
  owner?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  seller?: Pick<SellerProfile, 'storefront_name' | 'storefront_slug'> | null
}

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [media, setMedia] = useState<LightboxMedia | null>(null)
  const [gallery, setGallery] = useState<LightboxMedia[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('media').select('*').eq('id', id).single()
      .then(async ({ data }) => {
        if (data) {
          setMedia(data)
          const { data: allMedia } = await supabase
            .from('media')
            .select('*')
            .eq('context', data.context)
            .eq('media_type', data.media_type)
            .order('created_at', { ascending: false })
            .limit(50)

          const galleryItems = allMedia || [data]
          const idx = galleryItems.findIndex((m) => m.id === id)
          setGallery(galleryItems)
          setCurrentIndex(idx >= 0 ? idx : 0)
        }
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  if (!media) return <div className="text-center py-16 text-text-muted">Photo not found.</div>

  return (
    <MediaLightbox
      media={media}
      allMedia={gallery}
      currentIndex={currentIndex}
      onClose={() => router.back()}
      onNavigate={(idx) => {
        setCurrentIndex(idx)
        setMedia(gallery[idx])
      }}
    />
  )
}
