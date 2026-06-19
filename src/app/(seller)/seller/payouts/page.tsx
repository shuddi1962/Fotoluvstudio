'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Payout } from '@/types/database'

export default function SellerPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPayouts()
  }, [])

  const loadPayouts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('payouts')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    setPayouts(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Payout History</h1>
      {payouts.length === 0 ? (
        <EmptyState title="No payouts yet" description="Your earnings will be paid out monthly once you make a sale." />
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <Card key={payout.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">${payout.total_amount.toFixed(2)}</p>
                  <p className="text-sm text-text-muted">
                    {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={payout.status === 'paid' ? 'success' : 'default'}>{payout.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
