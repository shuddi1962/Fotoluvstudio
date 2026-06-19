import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/types/database'

interface PhotoCardProps {
  media: Media
  aspect?: 'square' | 'portrait' | 'landscape'
}

export default function PhotoCard({ media, aspect = 'square' }: PhotoCardProps) {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  }

  return (
    <Link href={`/gallery/${media.id}`} className="group block overflow-hidden rounded-lg bg-gray-100">
      <div className={`relative ${aspectClasses[aspect]} overflow-hidden`}>
        <Image
          src={media.storage_path_derivative || '/images/placeholder.svg'}
          alt={media.title || 'Photo'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {media.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
      {media.title && (
        <div className="p-3">
          <p className="text-sm font-medium truncate">{media.title}</p>
        </div>
      )}
    </Link>
  )
}
