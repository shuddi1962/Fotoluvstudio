'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/types/database'

interface MasonryGridProps {
  items: (Media & { urls?: { derivative?: string } })[]
  linkPrefix?: string
}

export default function MasonryGrid({ items, linkPrefix = '/gallery' }: MasonryGridProps) {
  if (!items.length) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">No photos yet.</p>
      </div>
    )
  }

  return (
    <div className="masonry-grid">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${linkPrefix}/${item.id}`}
          className="masonry-item block group relative overflow-hidden rounded-lg"
        >
          <Image
            src={item.storage_path_derivative || '/images/placeholder.svg'}
            alt={item.title || 'Photo'}
            width={item.width_px || 800}
            height={item.height_px || 600}
            className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {item.title && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
