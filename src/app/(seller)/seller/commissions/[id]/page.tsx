'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import type { CommissionRequest, CommissionMessage, CustomerMeasurement, MeasurementAppointment, FabricOption } from '@/types/database'

interface FullCommission extends CommissionRequest {
  fabric?: FabricOption
  customer?: { full_name: string | null; avatar_url: string | null }
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

const NEXT_STATUSES: Record<string, string[]> = {
  pending_review: ['quoted', 'cancelled'],
  quoted: ['deposit_paid', 'cancelled'],
  deposit_paid: ['in_production', 'fitting_scheduled', 'cancelled'],
  in_production: ['fitting_scheduled', 'ready', 'cancelled'],
  fitting_scheduled: ['in_production', 'ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
}

export default function SellerCommissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [commission, setCommission] = useState<FullCommission | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [priceInput, setPriceInput] = useState('')
  const [completionDate, setCompletionDate] = useState('')
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
      .select('*, fabric:fabric_choice_id(*), customer:profiles!customer_id(full_name, avatar_url), measurements:customer_measurements(*), appointments:measurement_appointments(*), messages:commission_messages(*, sender:profiles!sender_id(full_name, avatar_url))')
      .eq('id', id)
      .single()

    if (data) {
      setCommission(data as FullCommission)
      if (data.quoted_price) setPriceInput(String(data.quoted_price))
      if (data.estimated_completion_date) setCompletionDate(data.estimated_completion_date)
    }
    setLoading(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'quoted' && priceInput) {
      updates.quoted_price = parseFloat(priceInput)
      if (completionDate) updates.estimated_completion_date = completionDate
    }

    await fetch(`/api/commissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    loadCommission()
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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!commission) return <div className="text-center py-16 text-text-muted">Commission not found.</div>

  const nextStatuses = NEXT_STATUSES[commission.status] || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-headline">Commission Request</h1>
            <Badge variant={
              commission.status === 'pending_review' ? 'warning' :
              commission.status === 'deposit_paid' ? 'gold' :
              commission.status === 'ready' ? 'success' :
              commission.status === 'cancelled' ? 'error' : 'default'
            }>
              {STATUS_LABELS[commission.status]}
            </Badge>
          </div>
          <p className="text-text-muted">
            Customer: {commission.customer?.full_name || 'Unknown'}
            {commission.garment_category && ` · ${commission.garment_category.replace(/_/g, ' ')}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="border border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Customer</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-headline font-bold">
                {(commission.customer?.full_name || 'C')[0]}
              </div>
              <div>
                <p className="font-medium text-text">{commission.customer?.full_name || 'Customer'}</p>
                <p className="text-sm text-text-muted">
                  {commission.source_type === 'published_design' ? 'Based on published design' : 'Custom inspiration'}
                  {commission.garment_category && ` · ${commission.garment_category.replace(/_/g, ' ')}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Measurements */}
          {commission.measurements && commission.measurements.length > 0 && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Measurements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(commission.measurements[0].measurements).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-text-muted capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-text font-medium">{String(val)} <span className="text-text-muted text-xs">{commission.measurements![0].unit}</span></p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Appointments */}
          {commission.appointments && commission.appointments.length > 0 && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Appointments</h3>
              {commission.appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-text font-medium">
                      {new Date(apt.scheduled_for).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {apt.location && <p className="text-sm text-text-muted">{apt.location}</p>}
                  </div>
                  <Badge variant={apt.status === 'scheduled' ? 'warning' : apt.status === 'completed' ? 'success' : 'error'}>
                    {apt.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </Card>
          )}

          {/* Fabric */}
          {commission.fabric && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Fabric</h3>
              <p className="text-text font-medium">{commission.fabric.name}</p>
              {commission.fabric.description && <p className="text-sm text-text-muted">{commission.fabric.description}</p>}
              {commission.fabric.price_modifier > 0 && (
                <p className="text-sm text-gold font-medium mt-1">+₦{commission.fabric.price_modifier.toLocaleString()}</p>
              )}
            </Card>
          )}

          {/* Notes */}
          {commission.customer_notes && (
            <Card className="border border-border">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Customer Notes</h3>
              <p className="text-text">{commission.customer_notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar — Actions & Messages */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Actions</h3>

            {/* Quote / Pricing */}
            {(commission.status === 'pending_review' || commission.status === 'quoted') && (
              <div className="space-y-3 mb-4 p-3 bg-accent/5 rounded-lg">
                <h4 className="text-sm font-medium text-text">Set Quote</h4>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Quoted price (₦)"
                  className="input text-sm"
                />
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="input text-sm"
                />
              </div>
            )}

            {/* Status Actions */}
            <div className="space-y-2">
              {nextStatuses.map((status) => {
                const labels: Record<string, string> = {
                  quoted: 'Send Quote to Customer',
                  deposit_paid: 'Mark Deposit Received',
                  in_production: 'Start Production',
                  fitting_scheduled: 'Schedule Fitting',
                  ready: 'Mark Ready for Delivery',
                  completed: 'Mark Completed',
                  cancelled: 'Cancel Request',
                }
                return (
                  <Button
                    key={status}
                    variant={status === 'cancelled' ? 'ghost' : 'primary'}
                    size="sm"
                    className="w-full"
                    onClick={() => handleStatusChange(status)}
                  >
                    {labels[status] || status.replace('_', ' ')}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Messages */}
          <Card className="border border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Messages</h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
              {commission.messages && commission.messages.length > 0 ? (
                commission.messages.map((msg) => (
                  <div key={msg.id} className={`text-sm ${msg.sender_id === commission.designer_id ? 'text-right' : ''}`}>
                    <span className="font-medium text-text text-xs block mb-1">
                      {msg.sender?.full_name || 'Unknown'}
                    </span>
                    <span className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender_id === commission.designer_id
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-text'
                    }`}>
                      {msg.message}
                    </span>
                    <p className="text-xs text-text-muted mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
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
          </Card>
        </div>
      </div>
    </div>
  )
}
