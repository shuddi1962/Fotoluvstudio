'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount'),
      supabase.from('seller_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('order_items').select('commission_amount'),
    ]).then(([users, orders, sellers, items]) => {
      setAnalytics({
        totalUsers: users.count || 0,
        totalRevenue: orders.data?.reduce((s, o) => s + Number(o.total_amount), 0) || 0,
        totalSellers: sellers.count || 0,
        totalCommission: items.data?.reduce((s, i) => s + Number(i.commission_amount), 0) || 0,
        totalOrders: orders.data?.length || 0,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center"><p className="text-3xl font-headline text-accent">{analytics.totalUsers}</p><p className="text-sm text-text-muted">Total Users</p></Card>
        <Card className="text-center"><p className="text-3xl font-headline text-accent">{analytics.totalSellers}</p><p className="text-sm text-text-muted">Active Sellers</p></Card>
        <Card className="text-center"><p className="text-3xl font-headline text-accent">{analytics.totalOrders}</p><p className="text-sm text-text-muted">Total Orders</p></Card>
        <Card className="text-center"><p className="text-3xl font-headline text-accent">${analytics.totalRevenue.toFixed(2)}</p><p className="text-sm text-text-muted">Total Revenue</p></Card>
        <Card className="text-center bg-gold-bg/10 border-gold/30"><p className="text-3xl font-headline text-gold">${analytics.totalCommission.toFixed(2)}</p><p className="text-sm text-text-muted">Platform Commission</p></Card>
      </div>
    </div>
  )
}
