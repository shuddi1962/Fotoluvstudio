'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import MediaLightbox from '@/components/lightbox/MediaLightbox'
import Spinner from '@/components/ui/Spinner'
import { getDemoMedia, type DemoMedia } from '@/lib/demo-data'
import Image from 'next/image'
import Link from 'next/link'
import type { Media, Collection } from '@/types/database'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: col } = await supabase.from('collections').select('*').eq('id', id).single()
      if (col) {
        setCollection(col)
        const { data: colItems } = await supabase
          .from('collection_items')
          .select('media:media(*)')
          .eq('collection_id', id)
          .order('sort_order', { ascending: true })
        if (colItems) {
          setItems(colItems.map((ci: any) => ci.media).filter(Boolean))
        }
      } else {
        const demoMedia = await getDemoMedia(8)
        setCollection({ id, owner_id: '', title: 'Demo Collection', description: 'A curated collection of photography.', cover_media_id: null, created_at: new Date().toISOString() })
        setItems(demoMedia as unknown as Media[])
      }
      setLoading(false)
    })()
  }, [id])

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!collection) return <PublicLayout><div className="text-center py-16 text-text-muted">Collection not found.</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/collections" className="hover:text-accent">Collections</Link>
          <span>/</span>
          <span className="text-text truncate">{collection.title}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-headline">{collection.title}</h1>
          {collection.description && <p className="text-text-muted mt-2 max-w-2xl">{collection.description}</p>}
        </div>

        {items.length === 0 ? (
          <p className="text-text-muted text-center py-12">This collection is empty.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-accent/10 to-gold-bg/20 aspect-square text-left"
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
