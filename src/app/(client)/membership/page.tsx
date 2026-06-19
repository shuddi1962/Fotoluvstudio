'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { Subscription } from '@/types/database'

export default function MembershipPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isGoldMember, setIsGoldMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMembership()
  }, [])

  const loadMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_gold_member')
      .eq('id', user.id)
      .single()
    setIsGoldMember(profile?.is_gold_member || false)

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setSubscription(sub)
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Gold Membership</h1>

      <Card className={isGoldMember ? 'border-gold/30 bg-gold-bg/10' : ''}>
        <div className="text-center py-4">
          {isGoldMember ? (
            <>
              <Badge variant="gold" className="mb-4">Active Gold Member</Badge>
              <h2 className="text-2xl font-headline mb-2">You&apos;re a Gold Member</h2>
              <p className="text-text-muted mb-6">
                Enjoy watermark-free full-resolution downloads from all your event galleries.
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-text-muted">
                  Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
              <Button variant="ghost" className="mt-4 text-error">Cancel Membership</Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-headline mb-2">Upgrade to Gold</h2>
              <p className="text-text-muted mb-6">
                Get watermark-free full-resolution downloads for just $9.99/month.
              </p>
              <Button variant="gold" size="lg">Subscribe Now</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
