'use client'

import { GARMENT_CATEGORIES } from '@/lib/measurement-fields'
import type { FabricOption } from '@/types/database'
import type { Media } from '@/types/database'

interface Step1Data {
  source_type: 'published_design' | 'custom_upload'
  source_media_id: string | null
  customer_notes: string
  garment_category: string
}

interface Step2Data {
  fabric_choice_id: string | null
  use_own_fabric: boolean
}

interface Step3Data {
  measurements: Record<string, number>
  unit: 'cm' | 'inches'
  measurement_profile_id: string | null
  appointment?: { scheduled_for: string; location: string }
}

interface CommissionStep4Props {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  fabric: FabricOption | null
  selectedDesign: (Media & { title: string }) | null
  onNext: () => void
  onBack: () => void
}

export default function CommissionStep4({ step1, step2, step3, fabric, selectedDesign, onNext, onBack }: CommissionStep4Props) {
  const categoryLabel = GARMENT_CATEGORIES.find(c => c.value === step1.garment_category)?.label || step1.garment_category

  const basePrice = 50000 // placeholder base design price in NGN
  const fabricModifier = fabric?.price_modifier || 0
  const estimatedMin = basePrice + fabricModifier
  const estimatedMax = estimatedMin + 30000

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-headline text-text mb-2">Review Your Commission</h2>
        <p className="text-text-muted">Please review your request before submitting.</p>
      </div>

      <div className="space-y-6">
        {/* Design / Inspiration */}
        <div className="card p-5 border border-border">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Starting Point</h3>
          <div className="flex items-center gap-4">
            {selectedDesign?.storage_path_derivative ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src={selectedDesign.storage_path_derivative} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <p className="font-medium text-text">
                {step1.source_type === 'published_design'
                  ? (selectedDesign?.title || 'Published Design')
                  : 'Custom Inspiration Upload'}
              </p>
              <p className="text-sm text-text-muted capitalize">{categoryLabel}</p>
            </div>
          </div>
        </div>

        {/* Fabric */}
        <div className="card p-5 border border-border">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fabric Choice</h3>
          <div className="flex items-center gap-3">
            {step2.use_own_fabric ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <p className="text-text font-medium">I'll provide my own fabric</p>
              </>
            ) : fabric ? (
              <>
                {fabric.swatch_image_url ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={fabric.swatch_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-accent/10 shrink-0" />
                )}
                <div>
                  <p className="text-text font-medium">{fabric.name}</p>
                  {fabric.price_modifier > 0 && (
                    <p className="text-sm text-gold">+₦{fabric.price_modifier.toLocaleString()}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-text-muted">No fabric selected</p>
            )}
          </div>
        </div>

        {/* Measurements */}
        <div className="card p-5 border border-border">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Measurements</h3>
          {step3.appointment ? (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-text font-medium">In-Person Fitting Booked</p>
                <p className="text-sm text-text-muted">
                  {new Date(step3.appointment.scheduled_for).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(step3.measurements).map(([key, val]) => (
                <div key={key} className="text-sm">
                  <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}: </span>
                  <span className="text-text font-medium">{val} {step3.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {step1.customer_notes && (
          <div className="card p-5 border border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Your Notes</h3>
            <p className="text-text">{step1.customer_notes}</p>
          </div>
        )}

        {/* Price Estimate */}
        <div className="card p-5 border border-accent/20 bg-accent/5">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Price Estimate</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Estimated Range</span>
              <span className="text-text font-semibold">₦{estimatedMin.toLocaleString()} – ₦{estimatedMax.toLocaleString()}</span>
            </div>
            <p className="text-xs text-text-muted">Final price will be confirmed by the designer after reviewing your request.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button onClick={onBack} className="text-text-muted hover:text-text transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button onClick={onNext} className="btn-primary px-8 py-3">
          Submit Commission Request
        </button>
      </div>
    </div>
  )
}
