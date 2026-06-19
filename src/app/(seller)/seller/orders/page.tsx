'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { OrderItem } from '@/types/database'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('order_items')
      .select('*, order:orders(*), seller_product:seller_products(*)')
      .eq('seller_products.seller_id', user.id)

    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Orders</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="When customers purchase your products, orders will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Order #{item.order?.id?.slice(0, 8)}</p>
                  <p className="font-medium">${item.price_at_purchase.toFixed(2)} &times; {item.quantity}</p>
                  <p className="text-xs text-text-muted">Your cut: ${item.seller_payout_amount.toFixed(2)}</p>
                </div>
                <Badge variant={item.order?.status === 'shipped' ? 'success' : 'default'}>
                  {item.order?.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
