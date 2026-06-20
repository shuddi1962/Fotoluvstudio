'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { FabricOption } from '@/types/database'

interface CommissionStep2Props {
  designerId: string
  acceptsCustomFabric: boolean
  onNext: (data: { fabric_choice_id: string | null; use_own_fabric: boolean }) => void
  onBack: () => void
  initialData?: { fabric_choice_id?: string | null }
}

export default function CommissionStep2({ designerId, acceptsCustomFabric, onNext, onBack, initialData }: CommissionStep2Props) {
  const [fabrics, setFabrics] = useState<FabricOption[]>([])
  const [selectedFabricId, setSelectedFabricId] = useState<string | null>(initialData?.fabric_choice_id || null)
  const [useOwnFabric, setUseOwnFabric] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFabrics()
  }, [])

  const loadFabrics = async () => {
    const { data } = await supabase
      .from('fabric_options')
      .select('*')
      .eq('designer_id', designerId)
      .eq('is_active', true)
      .order('name')

    if (data) setFabrics(data)
    setLoading(false)
  }

  const handleNext = () => {
    onNext({
      fabric_choice_id: useOwnFabric ? null : selectedFabricId,
      use_own_fabric: useOwnFabric,
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-headline text-text mb-2">Choose Your Fabric</h2>
        <p className="text-text-muted max-w-xl mx-auto">Select from available materials or provide your own.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading fabric options...</div>
      ) : fabrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fabrics.map((fabric) => (
            <button
              key={fabric.id}
              onClick={() => { setSelectedFabricId(fabric.id); setUseOwnFabric(false) }}
              className={`card p-5 text-left transition-all border-2 ${
                selectedFabricId === fabric.id && !useOwnFabric
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {fabric.swatch_image_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={fabric.swatch_image_url} alt={fabric.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent/20 to-gold-bg/30 shrink-0 flex items-center justify-center">
                    <span className="text-accent/40 text-2xl font-headline">F</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-semibold text-text">{fabric.name}</h3>
                  {fabric.description && (
                    <p className="text-sm text-text-muted mt-1">{fabric.description}</p>
                  )}
                  <p className={`text-sm font-medium mt-2 ${fabric.price_modifier > 0 ? 'text-gold' : 'text-text-muted'}`}>
                    {fabric.price_modifier > 0 ? `+₦${fabric.price_modifier.toLocaleString()}` : 'Included'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {acceptsCustomFabric && (
        <div className="pt-2">
          <button
            onClick={() => { setUseOwnFabric(true); setSelectedFabricId(null) }}
            className={`card p-5 w-full text-left transition-all border-2 ${
              useOwnFabric ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-text">I'll Provide My Own Fabric</h3>
                <p className="text-sm text-text-muted mt-1">We'll discuss details after you submit your request.</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button onClick={onBack} className="text-text-muted hover:text-text transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedFabricId && !useOwnFabric}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Measurements
        </button>
      </div>
    </div>
  )
}
