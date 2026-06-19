'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import MasonryGrid from '@/components/gallery/MasonryGrid'
import Spinner from '@/components/ui/Spinner'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/types/database'
import { getDemoMedia, getDemoCollections } from '@/lib/demo-data'

const CATEGORIES = [
  { slug: '', label: 'All Photos' },
  { slug: 'landscape', label: 'Landscape' },
  { slug: 'urban', label: 'Urban' },
  { slug: 'portrait', label: 'Portrait' },
  { slug: 'nature', label: 'Nature' },
  { slug: 'abstract', label: 'Abstract' },
  { slug: 'travel', label: 'Travel' },
]

export default function GalleryClient() {
  const [photos, setPhotos] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
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
    setPhotos(data?.length ? data : await getDemoMedia(12))
    setLoading(false)
  }

  return (
    <div>
      {/* Quick category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              activeCategory === cat.slug
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search photos by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPhotos()}
          className="input max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Featured demo strip on empty state */}
          {!loading && photos.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-headline">Trending Now</h3>
                <Link href="/collections" className="text-xs text-accent hover:underline">View all</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                {photos.slice(0, 6).map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/gallery/${m.id}`}
                    className="snap-start shrink-0 w-48 md:w-56 group relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-100"
                  >
                    <Image src={m.storage_path_derivative} alt={m.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="224px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {m.title && <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">{m.title}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <MasonryGrid items={photos} />
        </>
      )}
    </div>
  )
}
