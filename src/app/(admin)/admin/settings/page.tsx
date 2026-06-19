'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { PlatformFeeRule } from '@/types/database'

export default function AdminSettingsPage() {
  const [rules, setRules] = useState<PlatformFeeRule[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('platform_fee_rules').select('*').then(({ data }) => {
      setRules(data || [])
      setLoading(false)
    })
  }, [])

  const updateRule = async (id: string, percent: number) => {
    await supabase.from('platform_fee_rules').update({ commission_percent: percent }).eq('id', id)
    setRules(rules.map(r => r.id === id ? { ...r, commission_percent: percent } : r))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Platform Settings</h1>
      <h2 className="text-xl font-headline mb-4">Commission Fee Rules</h2>
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{rule.category || 'All Categories (Default)'}</p>
                <p className="text-sm text-text-muted">Effective: {new Date(rule.effective_from).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="input w-20 text-center"
                  value={rule.commission_percent}
                  onChange={(e) => updateRule(rule.id, Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <span className="text-text-muted">%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
