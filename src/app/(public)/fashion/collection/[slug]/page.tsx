'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import MediaLightbox from '@/components/lightbox/MediaLightbox'
import Spinner from '@/components/ui/Spinner'
import { getDemoFashionItems } from '@/lib/demo-data'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/types/database'

export default function FashionCollectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const supabase = createClient()

  const collectionName = slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Fashion Collection'

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('context', 'fashion_showcase')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        setItems(data as Media[])
      } else {
        setItems(await getDemoFashionItems() as unknown as Media[])
      }
      setLoading(false)
    })()
  }, [])

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/fashion" className="hover:text-accent">Fashion</Link>
          <span>/</span>
          <span className="text-text truncate">{collectionName}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-headline">{collectionName}</h1>
          <p className="text-text-muted mt-2">Browse our curated fashion collection.</p>
        </div>

        {items.length === 0 ? (
          <p className="text-text-muted text-center py-12">No items in this collection.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-accent/10 to-gold-bg/20 aspect-[3/4] text-left"
              >
                <Image
                  src={item.storage_path_derivative || item.storage_path_original}
                  alt={item.title || ''}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="25vw"
                />
                {item.title && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          media={items[lightboxIndex]}
          allMedia={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </PublicLayout>
  )
}
