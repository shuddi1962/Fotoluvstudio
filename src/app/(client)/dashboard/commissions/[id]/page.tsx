'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { CommissionRequest, CommissionMessage, CustomerMeasurement, MeasurementAppointment, FabricOption, SellerProfile } from '@/types/database'

interface FullCommission extends CommissionRequest {
  fabric?: FabricOption
  designer?: Pick<SellerProfile, 'storefront_name' | 'storefront_slug'>
  measurements?: CustomerMeasurement[]
  appointments?: MeasurementAppointment[]
  messages?: (CommissionMessage & { sender?: { full_name: string | null; avatar_url: string | null } })[]
}

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

const TIMELINE_ORDER = ['pending_review', 'quoted', 'deposit_paid', 'in_production', 'fitting_scheduled', 'ready', 'completed']

export default function ClientCommissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [commission, setCommission] = useState<FullCommission | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadCommission()
  }, [id])

  const loadCommission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('commission_requests')
      .select('*, fabric:fabric_choice_id(*), designer:seller_profiles!designer_id(storefront_name, storefront_slug), measurements:customer_measurements(*), appointments:measurement_appointments(*), messages:commission_messages(*, sender:profiles!sender_id(full_name, avatar_url))')
      .eq('id', id)
      .single()

    if (data) setCommission(data as FullCommission)
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!commission) return <div className="text-center py-16 text-text-muted">Commission not found.</div>

  const currentIdx = TIMELINE_ORDER.indexOf(commission.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/dashboard/commissions" className="hover:text-accent">My Commissions</Link>
        <span>/</span>
        <span className="text-text truncate">Commission Detail</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline text-text">
            Commission with {commission.designer?.storefront_name || 'Designer'}
          </h1>
          <p className="text-text-muted mt-1">
            {commission.garment_category?.replace(/_/g, ' ') || 'Custom piece'}
            {commission.source_type === 'published_design' ? ' · Based on published design' : ' · Custom inspiration'}
          </p>
        </div>
        <Badge variant={
          commission.status === 'pending_review' ? 'warning' :
          commission.status === 'deposit_paid' ? 'gold' :
          commission.status === 'ready' ? 'success' :
          commission.status === 'completed' ? 'default' :
          commission.status === 'cancelled' ? 'error' : 'default'
        }>
          {STATUS_LABELS[commission.status]}
        </Badge>
      </div>

      {/* Timeline */}
      <Card className="border border-border mb-8">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Progress</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {TIMELINE_ORDER.filter(s => s !== 'cancelled').map((step, idx) => {
            const isComplete = idx <= currentIdx
            const isCurrent = idx === currentIdx
            return (
              <div key={step} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isCurrent ? 'bg-accent text-white' : isComplete ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-text-muted'
                }`}>
                  {isComplete && idx < currentIdx ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                  {STATUS_LABELS[step]}
                </div>
                {idx < TIMELINE_ORDER.length - 2 && (
                  <div className={`w-6 h-px ${isComplete ? 'bg-accent/40' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details */}
        <div className="space-y-4">
          {/* Design Reference */}
          <Card className="border border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Design Reference</h3>
            <p className="text-text">{commission.source_type === 'published_design' ? 'Based on a published design' : 'Custom inspiration upload'}</p>
          </Card>

          {/* Measurements */}
          {commission.measurements?.[0] && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Your Measurements</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(commission.measurements[0].measurements).map(([key, val]) => (
                  <div key={key} className="text-sm">
                    <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}: </span>
                    <span className="text-text font-medium">{String(val)} {commission.measurements![0].unit}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Appointment */}
          {commission.appointments?.[0] && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fitting Appointment</h3>
              <p className="text-text">
                {new Date(commission.appointments[0].scheduled_for).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
              {commission.appointments[0].location && <p className="text-sm text-text-muted mt-1">{commission.appointments[0].location}</p>}
            </Card>
          )}

          {/* Fabric */}
          {commission.fabric && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fabric</h3>
              <p className="text-text font-medium">{commission.fabric.name}</p>
              {commission.fabric.description && <p className="text-sm text-text-muted">{commission.fabric.description}</p>}
            </Card>
          )}

          {/* Notes */}
          {commission.customer_notes && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Your Notes</h3>
              <p className="text-text">{commission.customer_notes}</p>
            </Card>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="space-y-4">
          {/* Pricing */}
          {commission.quoted_price && (
            <Card className="border border-accent/20 bg-accent/5">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Quoted Price</span>
                  <span className="text-text font-semibold">₦{commission.quoted_price.toLocaleString()}</span>
                </div>
                {commission.deposit_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Deposit Paid</span>
                    <span className="text-success font-medium">₦{commission.deposit_amount.toLocaleString()}</span>
                  </div>
                )}
                {commission.quoted_price && (
                  <div className="flex justify-between text-sm border-t border-accent/10 pt-2">
                    <span className="text-text-muted">Balance</span>
                    <span className="text-text font-semibold">
                      ₦{(commission.quoted_price - (commission.deposit_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                {commission.estimated_completion_date && (
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-text-muted">Estimated Completion</span>
                    <span className="text-text font-medium">{new Date(commission.estimated_completion_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {commission.status === 'quoted' && (
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={async () => {
                    await fetch(`/api/commissions/${id}/pay-deposit`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({}),
                    })
                    loadCommission()
                  }}
                >
                  Pay Deposit — ₦{((commission.quoted_price! * (commission.deposit_percentage || 50) / 100)).toLocaleString()}
                </Button>
              )}

              {commission.status === 'ready' && (
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={async () => {
                    await fetch(`/api/commissions/${id}/pay-balance`, { method: 'POST' })
                    loadCommission()
                  }}
                >
                  Pay Balance — ₦{(commission.quoted_price! - (commission.deposit_amount || 0)).toLocaleString()}
                </Button>
              )}
            </Card>
          )}

          {/* Progress Photos */}
          {commission.messages?.some(m => m.attachment_url) && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Progress Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {commission.messages.filter(m => m.attachment_url).map((msg) => (
                  <img key={msg.id} src={msg.attachment_url!} alt="Progress" className="rounded-lg w-full aspect-square object-cover" />
                ))}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Link href={`/fashion/commission/${id}`}>
            <Button variant="secondary" className="w-full">View Full Details & Messages</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
