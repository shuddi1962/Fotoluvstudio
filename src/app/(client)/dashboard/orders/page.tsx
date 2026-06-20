'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  products: { title: string }[] | null
}

export default function ClientOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, status, total_amount, products(title)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you purchase from a seller, your orders will appear here."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders`}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.products?.[0]?.title || 'Order'}</p>
                    <p className="text-sm text-text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{order.total_amount?.toLocaleString()}</p>
                    <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
