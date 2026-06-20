'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import CommissionStep1 from './CommissionStep1'
import CommissionStep2 from './CommissionStep2'
import CommissionStep3 from './CommissionStep3'
import CommissionStep4 from './CommissionStep4'
import CommissionStep5 from './CommissionStep5'
import Spinner from '@/components/ui/Spinner'
import type { SellerProfile, SellerCommissionSettings, FabricOption, Media } from '@/types/database'

const STORAGE_KEY = 'commission_form_state'

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

interface SavedState {
  step1Data: Step1Data
  step2Data: Step2Data
  step3Data: Step3Data
  step: number
}

export default function CommissionForm() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [designer, setDesigner] = useState<SellerProfile | null>(null)
  const [settings, setSettings] = useState<SellerCommissionSettings | null>(null)
  const [fabrics, setFabrics] = useState<FabricOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [commissionId, setCommissionId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState(0)
  const [selectedDesign, setSelectedDesign] = useState<(Media & { title: string }) | null>(null)
  const [savedRedirect, setSavedRedirect] = useState(false)

  const [step1Data, setStep1Data] = useState<Step1Data>({
    source_type: 'published_design',
    source_media_id: null,
    customer_notes: '',
    garment_category: '',
  })
  const [step2Data, setStep2Data] = useState<Step2Data>({
    fabric_choice_id: null,
    use_own_fabric: false,
  })
  const [step3Data, setStep3Data] = useState<Step3Data>({
    measurements: {},
    unit: 'cm',
    measurement_profile_id: null,
  })

  useEffect(() => {
    // Restore saved state after login redirect
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: SavedState = JSON.parse(saved)
        sessionStorage.removeItem(STORAGE_KEY)
        setStep1Data(parsed.step1Data)
        setStep2Data(parsed.step2Data)
        setStep3Data(parsed.step3Data)
        setStep(parsed.step)
        setSavedRedirect(true)
      }
    } catch {}
    loadDesigner()
  }, [])

  const loadDesigner = async () => {
    let sellers

    const { data: commissionSellers } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('offers_commissions', true)
      .limit(1)
      .order('created_at', { ascending: true })

    if (commissionSellers && commissionSellers.length > 0) {
      sellers = commissionSellers
    } else {
      const { data: anySellers } = await supabase
        .from('seller_profiles')
        .select('*')
        .limit(1)
        .order('created_at', { ascending: true })

      sellers = anySellers
    }

    if (sellers && sellers.length > 0) {
      setDesigner(sellers[0])

      const { data: settingsData } = await supabase
        .from('seller_commission_settings')
        .select('*')
        .eq('designer_id', sellers[0].id)
        .single()

      if (settingsData) setSettings(settingsData)

      const { data: fabricData } = await supabase
        .from('fabric_options')
        .select('*')
        .eq('designer_id', sellers[0].id)
        .eq('is_active', true)

      if (fabricData) setFabrics(fabricData)
    }

    setLoading(false)
  }

  const saveState = () => {
    const state: SavedState = { step1Data, step2Data, step3Data, step }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data)
    if (data.source_media_id) {
      // won't have selectedDesign on first render — fine, just track the id
    }
    setStep(2)
  }

  const handleStep2Next = (data: Step2Data) => {
    setStep2Data(data)
    setStep(3)
  }

  const handleStep3Next = (data: Step3Data) => {
    setStep3Data(data)
    setStep(4)
  }

  const handleSubmit = async () => {
    if (!designer) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      saveState()
      router.push('/login?redirect=/fashion/commission/new')
      return
    }

    setSubmitting(true)

    const selectedFabric = step2Data.fabric_choice_id
      ? fabrics.find(f => f.id === step2Data.fabric_choice_id) || null
      : null

    const res = await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designer_id: designer.id,
        source_type: step1Data.source_type,
        source_media_id: step1Data.source_media_id,
        inspiration_media_ids: [],
        garment_category: step1Data.garment_category,
        fabric_choice_id: step2Data.use_own_fabric ? null : step2Data.fabric_choice_id,
        customer_notes: step1Data.customer_notes,
        deposit_percentage: settings?.default_deposit_percentage || 50,
      }),
    })

    if (!res.ok) {
      setSubmitting(false)
      return
    }

    const commission = await res.json()
    setCommissionId(commission.id)

    if (Object.keys(step3Data.measurements).length > 0) {
      await supabase.from('customer_measurements').insert({
        customer_id: commission.customer_id,
        commission_request_id: commission.id,
        garment_category: step1Data.garment_category,
        measurements: step3Data.measurements,
        unit: step3Data.unit,
      })
    }

    if (step3Data.appointment) {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commission_request_id: commission.id,
          scheduled_for: step3Data.appointment.scheduled_for,
          location: step3Data.appointment.location,
        }),
      })
    }

    const basePrice = 50000
    const fabricModifier = selectedFabric?.price_modifier || 0
    const depositPct = settings?.default_deposit_percentage || 50
    const deposit = (basePrice + fabricModifier) * depositPct / 100
    setDepositAmount(deposit)
    setStep(5)
    setSubmitting(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!designer) return <div className="text-center py-16 text-text-muted">No designer available for commissions at this time.</div>

  const selectedFabric = step2Data.fabric_choice_id
    ? fabrics.find(f => f.id === step2Data.fabric_choice_id) || null
    : null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === s ? 'bg-accent text-white' : step > s ? 'bg-accent/20 text-accent' : 'bg-gray-100 text-text-muted'
            }`}>
              {step > s ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            <span className={`text-sm hidden md:block ${step === s ? 'text-text font-medium' : 'text-text-muted'}`}>
              {['Design', 'Fabric', 'Measurements', 'Review'][s - 1]}
            </span>
            {s < 4 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 5 ? (
        <CommissionStep5 commissionId={commissionId!} depositAmount={depositAmount} />
      ) : (
        <>
          {step === 1 && (
            <CommissionStep1
              designer={designer}
              onNext={handleStep1Next}
              initialData={step1Data}
            />
          )}
          {step === 2 && (
            <CommissionStep2
              designerId={designer.id}
              acceptsCustomFabric={settings?.accepts_custom_fabric || false}
              onNext={handleStep2Next}
              onBack={() => setStep(1)}
              initialData={step2Data}
            />
          )}
          {step === 3 && (
            <CommissionStep3
              garmentCategory={step1Data.garment_category}
              designerId={designer.id}
              onNext={handleStep3Next}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <CommissionStep4
              step1={step1Data}
              step2={step2Data}
              step3={step3Data}
              fabric={selectedFabric}
              selectedDesign={selectedDesign}
              onNext={handleSubmit}
              onBack={() => setStep(3)}
            />
          )}
        </>
      )}
    </div>
  )
}
