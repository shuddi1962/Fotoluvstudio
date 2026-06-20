'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function SellerAnalyticsPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id)
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user.id)
    const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'pending')

    const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('seller_id', user.id).not('status', 'eq', 'cancelled')
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

    setStats({ totalProducts: totalProducts || 0, totalOrders: totalOrders || 0, totalRevenue, pendingOrders: pendingOrders || 0 })
    setLoading(false)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><div className="text-center py-6"><p className="text-3xl font-bold text-accent">{stats.totalProducts}</p><p className="text-sm text-text-muted mt-1">Products</p></div></Card>
        <Card><div className="text-center py-6"><p className="text-3xl font-bold text-accent">{stats.totalOrders}</p><p className="text-sm text-text-muted mt-1">Total Orders</p></div></Card>
        <Card><div className="text-center py-6"><p className="text-3xl font-bold text-accent">₦{stats.totalRevenue.toLocaleString()}</p><p className="text-sm text-text-muted mt-1">Revenue</p></div></Card>
        <Card><div className="text-center py-6"><p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p><p className="text-sm text-text-muted mt-1">Pending Orders</p></div></Card>
      </div>
    </div>
  )
}
