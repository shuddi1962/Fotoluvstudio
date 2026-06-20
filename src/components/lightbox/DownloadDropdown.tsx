'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { DownloadTier } from '@/types/database'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface DownloadDropdownProps {
  mediaId: string
  mediaType: 'photo' | 'video'
  isGoldMember: boolean
  isOwner: boolean
  isClientEventContext: boolean
}

export default function DownloadDropdown({
  mediaId,
  mediaType,
  isGoldMember,
  isOwner,
  isClientEventContext,
}: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tiers, setTiers] = useState<DownloadTier[]>([])
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [aspectLocked, setAspectLocked] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedTierName, setLockedTierName] = useState('')
  const [downloading, setDownloading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const allUnlocked = isGoldMember || isOwner

  useEffect(() => {
    supabase
      .from('download_tiers')
      .select('*')
      .eq('media_type', mediaType)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setTiers(data)
      })
  }, [mediaType])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTierClick = (tier: DownloadTier) => {
    setSelectedTier(tier.id)

    if (!allUnlocked && !tier.is_free_tier) {
      if (isClientEventContext) {
        downloadTier(tier.id)
      } else {
        setLockedTierName(tier.tier_name)
        setShowUpgradeModal(true)
      }
      return
    }

    downloadTier(tier.id)
  }

  const downloadTier = async (tierId: string) => {
    setDownloading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/serve-media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ media_id: mediaId, tier_id: tierId }),
      }
    )

    const data = await res.json()
    if (data.error === 'locked_tier') {
      setLockedTierName(data.tier?.name || 'this resolution')
      setShowUpgradeModal(true)
      setDownloading(false)
      return
    }

    const link = document.createElement('a')
    link.href = data.url
    link.download = `${data.tier?.name || 'download'}.${mediaType === 'video' ? 'mp4' : 'jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setDownloading(false)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={downloading}
        className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {downloading ? 'Processing...' : 'Free Download'}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-surface border border-border rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {mediaType === 'video' ? 'Resolution' : 'Size'}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {tiers.map((tier) => {
              const isLocked = !allUnlocked && !tier.is_free_tier
              return (
                <button
                  key={tier.id}
                  onClick={() => handleTierClick(tier)}
                  disabled={downloading}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                    ${selectedTier === tier.id ? 'bg-accent/5' : ''}
                    ${isLocked ? 'opacity-60 bg-gray-50 cursor-pointer' : 'hover:bg-accent/5'}
                    ${tier.is_free_tier ? '' : 'border-t border-dashed border-gray-200'}
                  `}
                >
                  <span className={isLocked ? 'text-text-muted' : 'text-text'}>
                    {tier.tier_name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {tier.width_px}×{tier.height_px}
                  </span>
                  {isLocked && (
                    <svg className="w-3.5 h-3.5 text-gold shrink-0 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9v3H4v8h16v-8h-1V9c0-3.87-3.13-7-7-7zm3 10H9V9c0-1.66 1.34-3 3-3s3 1.34 3 3v3z" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {mediaType === 'photo' && (
            <div className="p-3 border-t border-border">
              <p className="text-xs font-medium text-text-muted mb-2">Custom Size</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => {
                    setCustomWidth(e.target.value)
                    if (aspectLocked && tiers[0]) {
                      const aspect = tiers[0].width_px / tiers[0].height_px
                      setCustomHeight(String(Math.round(Number(e.target.value) / aspect)))
                    }
                  }}
                  className="input text-sm py-1.5 px-2 w-full"
                />
                <span className="text-text-muted">×</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => {
                    setCustomHeight(e.target.value)
                    if (aspectLocked && tiers[0]) {
                      const aspect = tiers[0].width_px / tiers[0].height_px
                      setCustomWidth(String(Math.round(Number(e.target.value) * aspect)))
                    }
                  }}
                  className="input text-sm py-1.5 px-2 w-full"
                />
                <button
                  onClick={() => setAspectLocked(!aspectLocked)}
                  className={`p-1.5 rounded ${aspectLocked ? 'text-accent bg-accent/10' : 'text-text-muted'}`}
                  title={aspectLocked ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Gold Membership Required">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-bg flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-2">Unlock {lockedTierName}</h3>
          <p className="text-sm text-text-muted mb-6">
            {isClientEventContext
              ? 'Upgrade to Gold Membership to download this resolution without watermarks.'
              : 'This resolution is available exclusively to Gold Members. Upgrade to unlock full-quality downloads.'
            }
          </p>
          <Button variant="gold" size="lg" className="w-full" onClick={() => window.location.href = '/pricing'}>
            Upgrade to Gold
          </Button>
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="w-full text-sm text-text-muted mt-3 hover:text-text transition-colors"
          >
            Maybe later
          </button>
        </div>
      </Modal>
    </div>
  )
}
