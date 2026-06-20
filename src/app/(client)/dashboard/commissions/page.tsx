'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import type { CommissionRequest } from '@/types/database'

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  quoted: 'Quote Ready',
  deposit_paid: 'Deposit Paid',
  in_production: 'In Production',
  fitting_scheduled: 'Fitting Scheduled',
  ready: 'Ready for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending_review: 'warning',
  quoted: 'default',
  deposit_paid: 'gold',
  in_production: 'default',
  fitting_scheduled: 'default',
  ready: 'success',
  completed: 'default',
  cancelled: 'error',
}

export default function MyCommissionsPage() {
  const [commissions, setCommissions] = useState<(CommissionRequest & { designer?: { storefront_name: string | null } })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadCommissions()
  }, [])

  const loadCommissions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('commission_requests')
      .select('*, designer:seller_profiles!designer_id(storefront_name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setCommissions(data)
    setLoading(false)
  }

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter)

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline">My Commissions</h1>
          <p className="text-text-muted">Track your bespoke design requests.</p>
        </div>
        <Link href="/fashion/commission/new">
          <Button>Start New Commission</Button>
        </Link>
      </div>

      {commissions.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending_review', 'quoted', 'in_production', 'ready', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-text-muted hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_LABELS[f] || f}
              <span className="ml-1.5 opacity-60">
                ({f === 'all' ? commissions.length : commissions.filter(c => c.status === f).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No commissions yet"
          description="When you submit a bespoke commission request, it will appear here."
          action={
            <Link href="/fashion/commission/new">
              <Button>Start Your First Commission</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/commissions/${request.id}`}
              className="card p-5 border border-border hover:border-accent/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-semibold text-text">
                    Commission with {(request as any).designer?.storefront_name || 'Designer'}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {request.garment_category ? request.garment_category.replace(/_/g, ' ') : 'Custom piece'}
                    {request.quoted_price && ` · ₦${request.quoted_price.toLocaleString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={(STATUS_COLORS[request.status] as any) || 'default'}>
                    {STATUS_LABELS[request.status] || request.status}
                  </Badge>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
