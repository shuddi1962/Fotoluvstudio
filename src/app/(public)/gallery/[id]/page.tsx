'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import MediaLightbox from '@/components/lightbox/MediaLightbox'
import PublicLayout from '@/components/layout/PublicLayout'
import Spinner from '@/components/ui/Spinner'
import { getDemoMedia } from '@/lib/demo-data'
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
    (async () => {
      const { data } = await supabase.from('media').select('*').eq('id', id).single()

      if (data) {
        setMedia(data)
        const { data: allMedia } = await supabase
          .from('media')
          .select('*')
          .eq('context', data.context)
          .eq('media_type', data.media_type)
          .order('created_at', { ascending: false })
          .limit(50)

        const galleryItems = (allMedia || [data]) as LightboxMedia[]
        const idx = galleryItems.findIndex((m) => m.id === id)
        setGallery(galleryItems)
        setCurrentIndex(idx >= 0 ? idx : 0)
      } else {
        const demo = (await getDemoMedia(12)) as LightboxMedia[]
        const found = demo.find((m) => m.id === id)
        if (found) {
          setMedia(found)
          setGallery(demo)
          setCurrentIndex(demo.findIndex((m) => m.id === id))
        }
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) return <PublicLayout><div className="flex justify-center items-center min-h-screen"><Spinner /></div></PublicLayout>
  if (!media) return <PublicLayout><div className="text-center py-16 text-text-muted">Photo not found.</div></PublicLayout>

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
