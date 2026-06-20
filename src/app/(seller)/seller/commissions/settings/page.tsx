'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { SellerCommissionSettings, SellerAvailability } from '@/types/database'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function CommissionSettingsPage() {
  const [settings, setSettings] = useState<SellerCommissionSettings | null>(null)
  const [availability, setAvailability] = useState<SellerAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [turnaround, setTurnaround] = useState('21')
  const [depositPct, setDepositPct] = useState('50')
  const [acceptsCustomFabric, setAcceptsCustomFabric] = useState(false)
  const [studioLocation, setStudioLocation] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: settingsData } = await supabase
      .from('seller_commission_settings')
      .select('*')
      .eq('designer_id', user.id)
      .single()

    if (settingsData) {
      setSettings(settingsData)
      setTurnaround(String(settingsData.default_turnaround_days))
      setDepositPct(String(settingsData.default_deposit_percentage))
      setAcceptsCustomFabric(settingsData.accepts_custom_fabric)
      setStudioLocation(settingsData.studio_location || '')
    }

    const { data: availData } = await supabase
      .from('seller_availability')
      .select('*')
      .eq('designer_id', user.id)

    if (availData) setAvailability(availData)
    setLoading(false)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const body = {
      designer_id: user.id,
      accepts_custom_fabric: acceptsCustomFabric,
      default_turnaround_days: parseInt(turnaround) || 21,
      default_deposit_percentage: parseInt(depositPct) || 50,
      studio_location: studioLocation || null,
    }

    const { error } = await supabase
      .from('seller_commission_settings')
      .upsert(body)

    if (!error) loadSettings()
    setSaving(false)
  }

  const toggleAvailability = async (dayOfWeek: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const existing = availability.find(a => a.day_of_week === dayOfWeek)
    if (existing) {
      await supabase
        .from('seller_availability')
        .update({ is_active: !existing.is_active })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('seller_availability')
        .insert({
          designer_id: user.id,
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '17:00',
        })
    }
    loadSettings()
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-headline">Commission Settings</h1>
        <p className="text-text-muted">Configure how bespoke commissions work for your store.</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="border border-border">
          <h3 className="text-lg font-headline font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Default Turnaround Time (days)</label>
                <input type="number" value={turnaround} onChange={(e) => setTurnaround(e.target.value)} className="input" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Default Deposit Percentage (%)</label>
                <input type="number" value={depositPct} onChange={(e) => setDepositPct(e.target.value)} className="input" min="0" max="100" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsCustomFabric}
                onChange={(e) => setAcceptsCustomFabric(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <div>
                <span className="text-sm font-medium text-text">Accept customer-provided fabric</span>
                <p className="text-xs text-text-muted">Allow customers to bring their own fabric for commissions.</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Studio Location</label>
              <input type="text" value={studioLocation} onChange={(e) => setStudioLocation(e.target.value)} className="input" placeholder="e.g. 123 Fashion Avenue, Lagos" />
            </div>

            <Button onClick={handleSaveSettings} loading={saving}>Save Settings</Button>
          </div>
        </Card>

        {/* Availability Calendar */}
        <Card className="border border-border">
          <h3 className="text-lg font-headline font-semibold mb-4">Availability for In-Person Fittings</h3>
          <p className="text-sm text-text-muted mb-4">Toggle which days of the week you're available for measurement appointments.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DAY_NAMES.map((day, idx) => {
              const avail = availability.find(a => a.day_of_week === idx)
              const isActive = avail?.is_active ?? false
              return (
                <button
                  key={idx}
                  onClick={() => toggleAvailability(idx)}
                  className={`card p-4 text-center transition-all border-2 ${
                    isActive ? 'border-accent bg-accent/5' : 'border-border opacity-60 hover:opacity-100'
                  }`}
                >
                  <p className="font-headline font-semibold text-text">{day}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {isActive ? `${avail?.start_time?.slice(0, 5) || '09:00'} - ${avail?.end_time?.slice(0, 5) || '17:00'}` : 'Not available'}
                  </p>
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
