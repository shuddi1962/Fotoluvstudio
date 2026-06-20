'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { MEASUREMENT_FIELDS, GARMENT_CATEGORIES, type MeasurementField } from '@/lib/measurement-fields'
import Button from '@/components/ui/Button'
import type { MeasurementProfile } from '@/types/database'

interface CommissionStep3Props {
  garmentCategory: string
  designerId: string
  onNext: (data: {
    measurements: Record<string, number>
    unit: 'cm' | 'inches'
    measurement_profile_id: string | null
    appointment?: { scheduled_for: string; location: string }
  }) => void
  onBack: () => void
}

export default function CommissionStep3({ garmentCategory, designerId, onNext, onBack }: CommissionStep3Props) {
  const [mode, setMode] = useState<'manual' | 'appointment'>('manual')
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm')
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentLocation, setAppointmentLocation] = useState('')
  const [saveProfile, setSaveProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fields = MEASUREMENT_FIELDS[garmentCategory] || MEASUREMENT_FIELDS.dress

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('measurement_profiles')
      .select('*')
      .eq('customer_id', user.id)
      .order('updated_at', { ascending: false })

    if (data) setProfiles(data)
    setLoading(false)
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfileId(profileId)
      const vals: Record<string, string> = {}
      for (const key of Object.keys(profile.measurements)) {
        vals[key] = String(profile.measurements[key])
      }
      setMeasurements(vals)
      setUnit(profile.unit)
    }
  }

  const handleChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }))
    setSelectedProfileId(null)
  }

  const allFieldsFilled = fields.every(f => !f.required || (measurements[f.key] && measurements[f.key].trim()))

  const canDoBoth = mode === 'manual' && appointmentDate && appointmentTime

  const handleNext = async () => {
    const numericMeasurements: Record<string, number> = {}
    for (const [key, val] of Object.entries(measurements)) {
      numericMeasurements[key] = parseFloat(val) || 0
    }

    let measurementProfileId: string | null = null
    if (saveProfile && Object.keys(numericMeasurements).length > 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('measurement_profiles')
          .insert({
            customer_id: user.id,
            label: `My ${GARMENT_CATEGORIES.find(c => c.value === garmentCategory)?.label || garmentCategory} Measurements`,
            measurements: numericMeasurements,
            unit,
          })
          .select()
          .single()
        if (data) measurementProfileId = data.id
      }
    }

    onNext({
      measurements: numericMeasurements,
      unit,
      measurement_profile_id: measurementProfileId,
      appointment: (appointmentDate && appointmentTime)
        ? {
            scheduled_for: `${appointmentDate}T${appointmentTime}:00`,
            location: appointmentLocation,
          }
        : undefined,
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-headline text-text mb-2">Your Measurements</h2>
        <p className="text-text-muted max-w-xl mx-auto">We need your measurements to create a perfect fit. Choose how you'd like to provide them.</p>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode('manual')}
          className={`card p-6 text-left transition-all border-2 ${mode === 'manual' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-1">Enter Measurements Manually</h3>
          <p className="text-sm text-text-muted">Use our guided form with visual references to enter your measurements at home.</p>
        </button>

        <button
          onClick={() => setMode('appointment')}
          className={`card p-6 text-left transition-all border-2 ${mode === 'appointment' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
        >
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-headline font-semibold mb-1">Book an In-Person Fitting</h3>
          <p className="text-sm text-text-muted">Visit the studio for a professional measurement session with the designer.</p>
        </button>
      </div>

      {mode === 'manual' && (
        <>
          {/* Saved Profiles */}
          {profiles.length > 0 && !loading && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">Use Saved Measurements</label>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                      selectedProfileId === profile.id
                        ? 'border-accent bg-accent text-white'
                        : 'border-border hover:border-accent/50 text-text'
                    }`}
                  >
                    {profile.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Unit Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${unit === 'cm' ? 'text-text' : 'text-text-muted'}`}>Centimeters</span>
            <button
              onClick={() => setUnit(unit === 'cm' ? 'inches' : 'cm')}
              className={`relative w-14 h-7 rounded-full transition-colors ${unit === 'cm' ? 'bg-accent' : 'bg-gold'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${unit === 'cm' ? 'left-1' : 'left-8'}`} />
            </button>
            <span className={`text-sm font-medium ${unit === 'inches' ? 'text-text' : 'text-text-muted'}`}>Inches</span>
          </div>

          {/* Measurement Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-text mb-1">
                  {field.label} {field.required && <span className="text-error">*</span>}
                </label>
                <p className="text-xs text-text-muted mb-2">{field.description}</p>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={measurements[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="input pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Save Profile */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveProfile}
              onChange={(e) => setSaveProfile(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text">Save these measurements for future commissions</span>
          </label>

          {/* Also book fitting hint */}
          <div className="bg-accent/5 rounded-xl p-4">
            <p className="text-sm text-text">
              <span className="font-medium">Tip:</span> You can enter measurements now AND still book an in-person fitting below for precision.
            </p>
          </div>
        </>
      )}

      {mode === 'appointment' && (
        <div className="space-y-6 max-w-lg mx-auto">
          <div className="bg-gold/5 rounded-xl p-6 text-center">
            <p className="text-text-muted mb-4">Book a session with the designer for professional measurements.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Preferred Date</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Preferred Time</label>
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Location / Notes</label>
            <input
              type="text"
              value={appointmentLocation}
              onChange={(e) => setAppointmentLocation(e.target.value)}
              placeholder="Studio address or any special instructions"
              className="input"
            />
          </div>
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
          disabled={mode === 'manual' ? !allFieldsFilled : !(appointmentDate && appointmentTime)}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}
