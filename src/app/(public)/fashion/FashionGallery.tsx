'use client'

import { useState } from 'react'
import Image from 'next/image'
import MediaLightbox from '@/components/lightbox/MediaLightbox'

interface FashionItem {
  id: string
  title: string
  storage_path_derivative: string
  [key: string]: any
}

interface FashionGalleryProps {
  items: FashionItem[]
}

export default function FashionGallery({ items }: FashionGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setLightboxIndex(idx)}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-gold-bg/30 text-left"
          >
            <div className="aspect-[3/4] relative">
              <Image
                src={item.storage_path_derivative}
                alt={item.title || "Fashion"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width:768px) 50vw, 25vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
              <p className="text-white text-sm font-medium">{item.title}</p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-white/90 text-accent text-xs font-semibold px-3 py-1 rounded-full">Shop now</span>
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          media={items[lightboxIndex] as any}
          allMedia={items as any}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </>
  )
}
