'use client'

import { useState } from 'react'
import Image from 'next/image'
import MediaLightbox from '@/components/lightbox/MediaLightbox'
import type { Media } from '@/types/database'

interface HomeGalleryClientProps {
  media: any[]
  videos: any[]
}

export default function HomeGalleryClient({ media, videos }: HomeGalleryClientProps) {
  const [lightboxMedia, setLightboxMedia] = useState<any[] | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (items: any[], index: number) => {
    setLightboxMedia(items)
    setLightboxIndex(index)
  }

  return (
    <>
      {/* Featured Photography */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((m: any, idx: number) => (
          <button
            key={m.id}
            onClick={() => openLightbox(media, idx)}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-gold-bg/30 text-left"
          >
            <div className="aspect-[4/3] relative">
              <Image src={m.storage_path_derivative} alt={m.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 50vw, 33vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {m.title && <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform"><p className="text-white text-sm font-medium truncate">{m.title}</p></div>}
          </button>
        ))}
      </div>

      {/* Video Showcase */}
      {videos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((v: any, idx: number) => (
            <button
              key={v.id}
              onClick={() => openLightbox(videos, idx)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-gold-bg/30 text-left"
            >
              <div className="aspect-[9/16] relative">
                <Image src={v.thumbnail} alt={v.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 50vw, 33vw" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-accent ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-white text-sm font-medium truncate">{v.title}</p>
                {v.duration && <p className="text-white/70 text-xs">{Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && lightboxMedia && (
        <MediaLightbox
          media={lightboxMedia[lightboxIndex]}
          allMedia={lightboxMedia}
          currentIndex={lightboxIndex}
          onClose={() => { setLightboxIndex(null); setLightboxMedia(null) }}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </>
  )
}
