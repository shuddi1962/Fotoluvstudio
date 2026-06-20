'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import type { Media, SellerProfile } from '@/types/database'

interface CommissionStep1Props {
  designer: SellerProfile
  onNext: (data: {
    source_type: 'published_design' | 'custom_upload'
    source_media_id: string | null
    inspiration_media_ids: string[]
    customer_notes: string
    garment_category: string
  }) => void
  initialData?: {
    source_type?: string
    source_media_id?: string | null
    inspiration_media_ids?: string[]
    customer_notes?: string
    garment_category?: string
  }
}

export default function CommissionStep1({ designer, onNext, initialData }: CommissionStep1Props) {
  const [mode, setMode] = useState<'browse' | 'upload'>(initialData?.source_type as 'browse' | 'upload' || 'browse')
  const [designs, setDesigns] = useState<(Media & { title: string })[]>([])
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(initialData?.source_media_id || null)
  const [inspirationFiles, setInspirationFiles] = useState<File[]>([])
  const [inspirationPreviewUrls, setInspirationPreviewUrls] = useState<string[]>([])
  const [customerNotes, setCustomerNotes] = useState(initialData?.customer_notes || '')
  const [garmentCategory, setGarmentCategory] = useState(initialData?.garment_category || '')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDesigns()
  }, [])

  const loadDesigns = async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .eq('owner_id', designer.id)
      .eq('context', 'fashion_showcase')
      .order('created_at', { ascending: false })

    if (data) setDesigns(data as (Media & { title: string })[])
    setLoading(false)
  }

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setInspirationFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setInspirationPreviewUrls(prev => [...prev, url])
    })
  }

  const removeInspiration = (idx: number) => {
    setInspirationFiles(prev => prev.filter((_, i) => i !== idx))
    setInspirationPreviewUrls(prev => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const canProceed = mode === 'browse' ? selectedDesignId && garmentCategory : inspirationFiles.length > 0 && garmentCategory

  const handleNext = () => {
    onNext({
      source_type: mode === 'browse' ? 'published_design' : 'custom_upload',
      source_media_id: selectedDesignId,
      inspiration_media_ids: [],
      customer_notes: customerNotes,
      garment_category: garmentCategory,
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-headline text-text mb-2">Choose Your Starting Point</h2>
        <p className="text-text-muted max-w-xl mx-auto">Start from one of {designer.storefront_name}'s published designs, or bring your own inspiration.</p>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode('browse')}
          className={`card p-6 text-left transition-all border-2 ${mode === 'browse' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-1">Browse Her Designs</h3>
          <p className="text-sm text-text-muted">Pick a piece from {designer.storefront_name}'s collection as your starting point.</p>
        </button>

        <button
          onClick={() => setMode('upload')}
          className={`card p-6 text-left transition-all border-2 ${mode === 'upload' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
        >
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-1">Upload Your Inspiration</h3>
          <p className="text-sm text-text-muted">Share a reference photo, sketch, or screenshot of what you have in mind.</p>
        </button>
      </div>

      {/* Browse Designs */}
      {mode === 'browse' && (
        <div className="space-y-4">
          <h3 className="text-lg font-headline font-semibold">Select a Design</h3>
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading designs...</div>
          ) : designs.length === 0 ? (
            <div className="text-center py-8 text-text-muted">No published designs available yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {designs.map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesignId(design.id)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    selectedDesignId === design.id ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/50'
                  }`}
                >
                  {design.storage_path_derivative && (
                    <Image src={design.storage_path_derivative} alt={design.title || 'Design'} fill className="object-cover" sizes="25vw" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">{design.title || 'Untitled'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Inspiration */}
      {mode === 'upload' && (
        <div className="space-y-4">
          <h3 className="text-lg font-headline font-semibold">Upload Reference Images</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors">
            <label className="cursor-pointer block">
              <svg className="w-10 h-10 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-text-muted mb-1">Click to upload inspiration images</p>
              <p className="text-xs text-text-muted/60">Pinterest screenshots, outfit photos, sketches — anything that captures your vision</p>
              <input type="file" multiple accept="image/*" onChange={handleInspirationUpload} className="hidden" />
            </label>
          </div>

          {inspirationPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inspirationPreviewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border group">
                  <img src={url} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeInspiration(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Garment Category */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Garment Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['dress', 'top', 'shirt', 'trousers', 'skirt', 'jacket'].map((cat) => (
            <button
              key={cat}
              onClick={() => setGarmentCategory(cat)}
              className={`px-4 py-3 text-sm rounded-lg border transition-all capitalize ${
                garmentCategory === cat
                  ? 'border-accent bg-accent text-white'
                  : 'border-border hover:border-accent/50 text-text'
              }`}
            >
              {cat === 'trousers' ? 'Trousers / Pants' : cat === 'top' ? 'Top / Blouse' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Tell us what you're imagining (optional)</label>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Describe any modifications, details, or special requests you have in mind..."
          className="input min-h-[100px] resize-y"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Fabric Selection
        </button>
      </div>
    </div>
  )
}
