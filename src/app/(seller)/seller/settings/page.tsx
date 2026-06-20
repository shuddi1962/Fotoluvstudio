'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SellerSettingsPage() {
  const supabase = createClient()
  const [seller, setSeller] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSeller()
  }, [])

  const loadSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('seller_profiles').select('*').eq('id', user.id).single()
    if (data) setSeller(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('seller_profiles').update({
      business_name: seller.business_name,
      bio: seller.bio,
      phone: seller.phone,
      location: seller.location,
      website: seller.website,
      offers_commissions: seller.offers_commissions,
      commission_deposit_percent: seller.commission_deposit_percent
    }).eq('id', user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!seller) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Seller Settings</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <input value={seller.business_name || ''} onChange={e => setSeller({...seller, business_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea value={seller.bio || ''} onChange={e => setSeller({...seller, bio: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={seller.phone || ''} onChange={e => setSeller({...seller, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={seller.location || ''} onChange={e => setSeller({...seller, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input value={seller.website || ''} onChange={e => setSeller({...seller, website: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="offers_commissions" checked={seller.offers_commissions || false} onChange={e => setSeller({...seller, offers_commissions: e.target.checked})} className="w-4 h-4" />
            <label htmlFor="offers_commissions" className="text-sm font-medium">I offer bespoke/custom design commissions</label>
          </div>
          <div className="pt-2">
            <Button type="submit" loading={saving}>Save Settings</Button>
            {saved && <span className="ml-3 text-sm text-green-600">Saved!</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
