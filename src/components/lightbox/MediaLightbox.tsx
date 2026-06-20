'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import DownloadDropdown from './DownloadDropdown'
import AddTextOverlay from './AddTextOverlay'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import type { Media, Profile, SellerProfile } from '@/types/database'

interface LightboxMedia extends Media {
  owner?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  seller?: Pick<SellerProfile, 'storefront_name' | 'storefront_slug'> | null
}

interface MediaLightboxProps {
  media: LightboxMedia
  relatedMedia?: LightboxMedia[]
  allMedia?: LightboxMedia[]
  currentIndex?: number
  onClose: () => void
  onNavigate?: (index: number) => void
  onFavorite?: () => void
  isFavorited?: boolean
}

export default function MediaLightbox({
  media,
  relatedMedia,
  allMedia,
  currentIndex = 0,
  onClose,
  onNavigate,
  onFavorite,
  isFavorited,
}: MediaLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [showAddText, setShowAddText] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [canvaLoading, setCanvaLoading] = useState(false)
  const [gifLoading, setGifLoading] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [upgradeAction, setUpgradeAction] = useState('')
  const supabase = createClient()

  const isVideo = media.media_type === 'video'
  const allUnlocked = userProfile?.is_gold_member || false
  const isOwner = userProfile?.id === media.owner_id

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: profile }) => {
          setUserProfile(profile)
        })
      }
    })
  }, [])

  useEffect(() => {
    setIsZoomed(false)
    setZoomLevel(1)
    setPan({ x: 0, y: 0 })
    setShowEditMenu(false)
  }, [media.id])

  const handleZoomToggle = () => {
    if (isVideo) return
    setIsZoomed(!isZoomed)
    setZoomLevel(1)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isZoomed) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoomLevel((prev) => Math.max(1, Math.min(5, prev + delta)))
  }, [isZoomed])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed || zoomLevel <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handlePrev = () => {
    if (allMedia && currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (allMedia && currentIndex < allMedia.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [currentIndex, allMedia?.length])

  const handleEditWithCanva = async () => {
    if (!userProfile) {
      setUpgradeAction('Sign in to edit with Canva')
      setUpgradeModalOpen(true)
      return
    }

    if (!allUnlocked && !isOwner) {
      setUpgradeAction('Edit with Canva requires Gold Membership')
      setUpgradeModalOpen(true)
      return
    }

    setCanvaLoading(true)
    setShowEditMenu(false)

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/canva-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ media_id: media.id, design_name: media.title }),
      }
    )

    const data = await res.json()

    if (data.session_url) {
      window.open(data.session_url, '_blank')
    } else if (data.error === 'canva_not_configured') {
      alert('Canva integration is not configured yet.')
    }

    setCanvaLoading(false)
  }

  const handleConvertToGif = async () => {
    if (!userProfile) {
      setUpgradeAction('Sign in to use Convert to GIF')
      setUpgradeModalOpen(true)
      return
    }

    setGifLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/convert-to-gif`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          media_id: media.id,
          start_time: 0,
          duration_sec: 3,
        }),
      }
    )

    const data = await res.json()

    if (data.url) {
      const link = document.createElement('a')
      link.href = data.url
      link.download = `${media.title || 'video'}.gif`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    setGifLoading(false)
  }

  const storefrontSlug = media.seller?.storefront_slug || media.owner?.id

  if (showAddText) {
    return (
      <AddTextOverlay
        mediaId={media.id}
        mediaUrl={media.storage_path_derivative || media.storage_path_original}
        sourceWasWatermarked={!allUnlocked && !isOwner}
        onClose={() => setShowAddText(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {media.owner && (
            <Link
              href={storefrontSlug ? `/sellers/${storefrontSlug}` : '#'}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                {media.owner.avatar_url && (
                  <Image src={media.owner.avatar_url} alt="" width={32} height={32} className="object-cover" />
                )}
              </div>
              <span className="text-white text-sm font-medium">
                {media.seller?.storefront_name || media.owner.full_name || 'Unknown'}
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onFavorite && (
            <button onClick={onFavorite} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Like">
              <svg
                className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {!isVideo && (
            <button
              onClick={handleZoomToggle}
              className={`p-2 rounded-lg transition-colors ${isZoomed ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title={isZoomed ? 'Exit zoom' : 'Zoom'}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isZoomed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3H7m3 0h3" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3H7m3 0h3" />
                )}
              </svg>
            </button>
          )}

          {isVideo && (
            <button
              onClick={() => setIsZoomed(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Fullscreen video"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}

          {/* Add Text */}
          <button
            onClick={() => setShowAddText(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Add Text"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          {/* Edit with Canva */}
          <div className="relative">
            <button
              onClick={() => setShowEditMenu(!showEditMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {showEditMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl z-50">
                <button
                  onClick={handleEditWithCanva}
                  disabled={canvaLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-accent/5 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {canvaLoading ? 'Opening Canva...' : 'Edit with Canva'}
                </button>
              </div>
            )}
          </div>

          {/* Convert to GIF (video only) */}
          {isVideo && (
            <button
              onClick={handleConvertToGif}
              disabled={gifLoading}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Convert to GIF"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </button>
          )}

          <DownloadDropdown
            mediaId={media.id}
            mediaType={media.media_type}
            isGoldMember={allUnlocked}
            isOwner={isOwner}
            isClientEventContext={media.context === 'client_event'}
          />

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Close">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {allMedia && allMedia.length > 1 && currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div
          className="relative flex items-center justify-center w-full h-full px-12"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : isZoomed ? 'grab' : 'default' }}
        >
          {isVideo ? (
            isZoomed ? (
              <video
                src={media.storage_path_derivative || media.storage_path_original}
                controls
                autoPlay
                className="max-w-full max-h-full"
                playsInline
              />
            ) : (
              <video
                src={media.storage_path_derivative || media.storage_path_original}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] object-contain"
                playsInline
              />
            )
          ) : (
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: isZoomed ? `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)` : 'none',
                maxWidth: isZoomed ? 'none' : '90vw',
                maxHeight: isZoomed ? 'none' : '85vh',
              }}
            >
              <Image
                src={media.storage_path_derivative || media.storage_path_original}
                alt={media.title || 'Media'}
                width={media.width_px || 1920}
                height={media.height_px || 1080}
                className="object-contain"
                style={{
                  maxWidth: isZoomed ? 'none' : '90vw',
                  maxHeight: isZoomed ? 'none' : '85vh',
                  width: isZoomed ? `${zoomLevel * 100}%` : 'auto',
                  height: isZoomed ? `${zoomLevel * 100}%` : 'auto',
                }}
                priority
                draggable={false}
              />
            </div>
          )}
        </div>

        {allMedia && allMedia.length > 1 && currentIndex < allMedia.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0 border-t border-white/10">
        <div className="flex items-center gap-4">
          {media.title && (
            <span className="text-white/90 text-sm font-medium truncate max-w-md">{media.title}</span>
          )}
          {media.tags && media.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {media.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isZoomed && !isVideo && (
            <span className="text-white/50 text-xs">{Math.round(zoomLevel * 100)}%</span>
          )}
          {allMedia && allMedia.length > 1 && (
            <span className="text-white/50 text-xs">{currentIndex + 1} / {allMedia.length}</span>
          )}
        </div>
      </div>

      {/* Related Media Strip */}
      {relatedMedia && relatedMedia.length > 0 && (
        <div className="px-4 md:px-6 py-3 shrink-0 border-t border-white/10 overflow-x-auto">
          <div className="flex gap-2">
            {relatedMedia.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const idx = allMedia?.findIndex((m) => m.id === item.id)
                  if (idx !== undefined && idx >= 0 && onNavigate) onNavigate(idx)
                }}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                  ${item.id === media.id ? 'border-accent' : 'border-transparent hover:border-white/30'}`}
              >
                {item.media_type === 'video' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={item.storage_path_derivative || item.storage_path_original}
                    alt=""
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade / Auth Modal */}
      <Modal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} title="Gold Membership Required">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-bg flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-2">{upgradeAction}</h3>
          <p className="text-sm text-text-muted mb-6">
            Upgrade to Gold Membership to unlock all editing and download features.
          </p>
          <Button variant="gold" size="lg" className="w-full" onClick={() => window.location.href = '/pricing'}>
            Upgrade to Gold
          </Button>
          <button
            onClick={() => setUpgradeModalOpen(false)}
            className="w-full text-sm text-text-muted mt-3 hover:text-text transition-colors"
          >
            Maybe later
          </button>
        </div>
      </Modal>
    </div>
  )
}
