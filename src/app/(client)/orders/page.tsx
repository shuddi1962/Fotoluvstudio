'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Order } from '@/types/database'

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="When you place an order, it will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Order #{order.id.slice(0, 8)}</p>
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={order.status === 'shipped' ? 'success' : order.status === 'paid' ? 'gold' : 'default'}>
                  {order.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
