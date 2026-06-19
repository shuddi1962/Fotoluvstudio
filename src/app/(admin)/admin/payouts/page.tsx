'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Payout } from '@/types/database'

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('payouts').select('*, seller_profiles(*)').order('created_at', { ascending: false })
      .then(({ data }) => { setPayouts(data || []); setLoading(false) })
  }, [])

  const markPaid = async (id: string) => {
    await supabase.from('payouts').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    setPayouts(payouts.map(p => p.id === id ? { ...p, status: 'paid' as const, paid_at: new Date().toISOString() } : p))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Payout Management</h1>
      {payouts.length === 0 ? (
        <EmptyState title="No payouts yet" />
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <Card key={payout.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">${payout.total_amount.toFixed(2)}</p>
                  <p className="text-sm text-text-muted">{new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={payout.status === 'paid' ? 'success' : 'warning'}>{payout.status}</Badge>
                  {payout.status === 'pending' && <Button size="sm" onClick={() => markPaid(payout.id)}>Mark Paid</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
