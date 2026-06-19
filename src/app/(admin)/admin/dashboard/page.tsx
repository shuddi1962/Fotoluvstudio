'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

interface PlatformStats {
  totalUsers: number
  totalSellers: number
  totalOrders: number
  totalRevenue: number
  goldMembers: number
  totalEvents: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, totalSellers: 0, totalOrders: 0, totalRevenue: 0, goldMembers: 0, totalEvents: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalSellers } = await supabase.from('seller_profiles').select('*', { count: 'exact', head: true })
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const { count: goldMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_gold_member', true)
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true })
    const { data: orders } = await supabase.from('orders').select('total_amount')
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    setStats({
      totalUsers: totalUsers || 0,
      totalSellers: totalSellers || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      goldMembers: goldMembers || 0,
      totalEvents: totalEvents || 0,
    })
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, href: '/admin/clients' },
    { label: 'Gold Members', value: stats.goldMembers, href: '/admin/clients', gold: true },
    { label: 'Sellers', value: stats.totalSellers, href: '/admin/sellers' },
    { label: 'Total Orders', value: stats.totalOrders, href: '/admin/orders' },
    { label: 'Events', value: stats.totalEvents, href: '/admin/clients' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, href: '/admin/analytics', gold: true },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className={`text-center hover:shadow-md transition-shadow ${card.gold ? 'bg-gold-bg/10 border-gold/30' : ''}`}>
              <p className="text-3xl font-headline" style={{ color: card.gold ? '#B68A2E' : '#2D6E5E' }}>{card.value}</p>
              <p className="text-sm text-text-muted">{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/clients" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Client Management</h3><p className="text-sm text-text-muted mt-1">Manage clients, events, and galleries.</p></Link>
        <Link href="/admin/sellers" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Seller Management</h3><p className="text-sm text-text-muted mt-1">View and manage sellers.</p></Link>
        <Link href="/admin/orders" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Order Management</h3><p className="text-sm text-text-muted mt-1">View all platform orders.</p></Link>
        <Link href="/admin/curation" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Curation</h3><p className="text-sm text-text-muted mt-1">Feature photos and collections.</p></Link>
        <Link href="/admin/payouts" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Payouts</h3><p className="text-sm text-text-muted mt-1">Manage seller payouts.</p></Link>
        <Link href="/admin/analytics" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Analytics</h3><p className="text-sm text-text-muted mt-1">Platform-wide analytics.</p></Link>
        <Link href="/admin/booking-inquiries" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Booking Inquiries</h3><p className="text-sm text-text-muted mt-1">View photography booking leads.</p></Link>
        <Link href="/admin/moderations" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Moderation Queue</h3><p className="text-sm text-text-muted mt-1">Review flagged content.</p></Link>
        <Link href="/admin/settings" className="card p-6 hover:shadow-md transition-shadow"><h3 className="font-headline font-semibold">Settings</h3><p className="text-sm text-text-muted mt-1">Platform fee rules and config.</p></Link>
      </div>
    </div>
  )
}
