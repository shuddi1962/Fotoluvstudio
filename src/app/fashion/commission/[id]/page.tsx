'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import type { CommissionRequest, CommissionMessage, CustomerMeasurement, MeasurementAppointment, FabricOption, SellerProfile } from '@/types/database'
import Link from 'next/link'

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

const STATUS_COLORS: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  deposit_paid: 'bg-purple-100 text-purple-800',
  in_production: 'bg-indigo-100 text-indigo-800',
  fitting_scheduled: 'bg-cyan-100 text-cyan-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function CommissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [commission, setCommission] = useState<FullCommission | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadCommission()
  }, [id])

  const loadCommission = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('commission_requests')
      .select('*, fabric:fabric_choice_id(*), designer:seller_profiles!designer_id(storefront_name, storefront_slug), measurements:customer_measurements(*), appointments:measurement_appointments(*), messages:commission_messages(*, sender:profiles!sender_id(full_name, avatar_url))')
      .eq('id', id)
      .single()

    if (data) setCommission(data as FullCommission)
    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    setSending(true)

    await fetch(`/api/commissions/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    setMessage('')
    setSending(false)
    loadCommission()
  }

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!commission) return <PublicLayout><div className="text-center py-16 text-text-muted">Commission not found.</div></PublicLayout>

  const isCustomer = true // this page is for customer view

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/dashboard/commissions" className="hover:text-accent">My Commissions</Link>
          <span>/</span>
          <span className="text-text truncate">Commission Detail</span>
        </nav>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline text-text">Commission Detail</h1>
            <p className="text-text-muted mt-1">
              with {commission.designer?.storefront_name || 'Designer'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[commission.status] || 'bg-gray-100 text-gray-800'}`}>
            {STATUS_LABELS[commission.status] || commission.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Design Reference */}
            <div className="card p-6 border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Design Reference</h3>
              <p className="text-text">
                {commission.source_type === 'published_design' ? 'Based on a published design' : 'Custom inspiration upload'}
              </p>
              {commission.garment_category && (
                <p className="text-sm text-text-muted mt-1 capitalize">{commission.garment_category}</p>
              )}
            </div>

            {/* Measurements */}
            {commission.measurements && commission.measurements.length > 0 && (
              <div className="card p-6 border border-border">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Measurements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(commission.measurements[0].measurements).map(([key, val]) => (
                    <div key={key} className="text-sm">
                      <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}: </span>
                      <span className="text-text font-medium">{String(val)} {commission.measurements![0].unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointment */}
            {commission.appointments && commission.appointments.length > 0 && (
              <div className="card p-6 border border-border">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fitting Appointment</h3>
                <p className="text-text">
                  {new Date(commission.appointments[0].scheduled_for).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {commission.appointments[0].location && (
                  <p className="text-sm text-text-muted mt-1">{commission.appointments[0].location}</p>
                )}
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                  commission.appointments[0].status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  commission.appointments[0].status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {commission.appointments[0].status.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Fabric */}
            {commission.fabric && (
              <div className="card p-6 border border-border">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fabric</h3>
                <p className="text-text">{commission.fabric.name}</p>
                {commission.fabric.description && (
                  <p className="text-sm text-text-muted mt-1">{commission.fabric.description}</p>
                )}
              </div>
            )}

            {/* Notes */}
            {commission.customer_notes && (
              <div className="card p-6 border border-border">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Your Notes</h3>
                <p className="text-text">{commission.customer_notes}</p>
              </div>
            )}

            {/* Pricing */}
            {commission.quoted_price && (
              <div className="card p-6 border border-accent/20 bg-accent/5">
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
                  {commission.quoted_price && commission.deposit_amount && (
                    <div className="flex justify-between text-sm border-t border-accent/10 pt-2">
                      <span className="text-text-muted">Balance</span>
                      <span className="text-text font-semibold">₦{(commission.quoted_price - commission.deposit_amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {(commission.status === 'ready') && (
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

                {(commission.status === 'quoted') && (
                  <Button
                    size="lg"
                    className="w-full mt-4"
                    onClick={async () => {
                      await fetch(`/api/commissions/${id}/pay-deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
                      loadCommission()
                    }}
                  >
                    Pay Deposit — ₦{((commission.quoted_price! * (commission.deposit_percentage || 50) / 100)).toLocaleString()}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — Messages */}
          <div className="space-y-4">
            <div className="card p-5 border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Messages</h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {commission.messages && commission.messages.length > 0 ? (
                  commission.messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${msg.sender_id === commission.customer_id ? '' : 'text-right'}`}>
                      <span className="font-medium text-text text-xs block mb-1">
                        {msg.sender?.full_name || 'Unknown'}
                      </span>
                      <span className={`inline-block px-3 py-2 rounded-lg ${
                        msg.sender_id === commission.customer_id
                          ? 'bg-accent/10 text-text'
                          : 'bg-gray-100 text-text'
                      }`}>
                        {msg.message}
                      </span>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted text-center py-4">No messages yet.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input flex-1 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="sm" onClick={handleSendMessage} disabled={sending || !message.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
