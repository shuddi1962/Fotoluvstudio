'use client'

import Image from 'next/image'
import Button from '@/components/ui/Button'
import type { Media } from '@/types/database'

interface PhotoViewProps {
  media: Media
  onFavorite?: () => void
  isFavorited?: boolean
  showShopCTA?: boolean
  onShop?: () => void
}

export default function PhotoView({ media, onFavorite, isFavorited, showShopCTA, onShop }: PhotoViewProps) {
  return (
    <div className="space-y-6">
      <div className="relative w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={media.storage_path_derivative || '/images/placeholder.svg'}
          alt={media.title || 'Photo'}
          width={media.width_px || 1200}
          height={media.height_px || 800}
          className="max-h-[80vh] w-auto object-contain"
          priority
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          {media.title && <h1 className="text-2xl font-headline">{media.title}</h1>}
          {media.tags && media.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {media.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-text-muted px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onFavorite && (
            <button onClick={onFavorite} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {showShopCTA && (
            <Button variant="primary" onClick={onShop}>
              Shop This Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
