'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import type { CommissionRequest, FabricOption } from '@/types/database'

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  quoted: 'Quoted',
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

export default function SellerCommissionsPage() {
  const [commissions, setCommissions] = useState<(CommissionRequest & { customer?: { full_name: string | null } })[]>([])
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
      .select('*, customer:profiles!customer_id(full_name)')
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setCommissions(data)
    setLoading(false)
  }

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter)

  const counts = {
    all: commissions.length,
    pending_review: commissions.filter(c => c.status === 'pending_review').length,
    quoted: commissions.filter(c => c.status === 'quoted').length,
    in_production: commissions.filter(c => c.status === 'in_production').length,
    ready: commissions.filter(c => c.status === 'ready').length,
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline">Commissions</h1>
          <p className="text-text-muted">Manage bespoke design requests from customers.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/seller/commissions/fabrics">
            <Button variant="secondary" size="sm">Fabrics</Button>
          </Link>
          <Link href="/seller/commissions/settings">
            <Button variant="secondary" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending_review', label: 'Pending', count: counts.pending_review },
          { key: 'quoted', label: 'Quoted', count: counts.quoted },
          { key: 'in_production', label: 'In Production', count: counts.in_production },
          { key: 'ready', label: 'Ready', count: counts.ready },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`card p-4 text-center transition-all ${
              filter === stat.key ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-accent/50'
            }`}
          >
            <p className="text-2xl font-headline text-accent">{stat.count}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No commission requests"
          description={filter === 'all' ? "You haven't received any commission requests yet." : `No requests with status "${STATUS_LABELS[filter] || filter}".`}
          action={
            <Link href="/seller/commissions/settings">
              <Button variant="secondary">Configure Commission Settings</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <Link
              key={request.id}
              href={`/seller/commissions/${request.id}`}
              className="card p-5 border border-border hover:border-accent/50 transition-all block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-semibold text-text">
                    Commission from {(request as any).customer?.full_name || 'Customer'}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {request.garment_category ? request.garment_category.replace('_', ' ') : 'Custom piece'}
                    {request.source_type === 'published_design' ? ' · Based on published design' : ' · Custom inspiration'}
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
