'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { SellerProfile } from '@/types/database'

export default function SellerDashboard() {
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pendingCommissions: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setSeller(sellerData)

    const { count: productCount } = await supabase
      .from('seller_products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)

    const { data: orderData } = await supabase
      .from('order_items')
      .select('*, seller_products!inner(seller_id)')
      .eq('seller_products.seller_id', user.id)

    const { count: pendingCount } = await supabase
      .from('commission_requests')
      .select('*', { count: 'exact', head: true })
      .eq('designer_id', user.id)
      .eq('status', 'pending_review')

    const revenue = orderData?.reduce((sum, item) => sum + Number(item.seller_payout_amount), 0) || 0
    setStats({ products: productCount || 0, orders: orderData?.length || 0, revenue, pendingCommissions: pendingCount || 0 })
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline">Seller Dashboard</h1>
          <p className="text-text-muted">{seller?.storefront_name || 'Your Store'}</p>
        </div>
        <Link href="/seller/upload">
          <Button>Upload New Design</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-headline text-accent">{stats.products}</p>
          <p className="text-sm text-text-muted">Products Listed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-headline text-accent">{stats.orders}</p>
          <p className="text-sm text-text-muted">Orders</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-headline text-accent">${stats.revenue.toFixed(2)}</p>
          <p className="text-sm text-text-muted">Total Revenue</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/seller/products" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-headline font-semibold mb-2">My Products</h3>
          <p className="text-sm text-text-muted">Manage your listed products and designs.</p>
        </Link>
        <Link href="/seller/orders" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-headline font-semibold mb-2">Orders</h3>
          <p className="text-sm text-text-muted">View your sales and order history.</p>
        </Link>
        <Link href="/seller/payouts" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-headline font-semibold mb-2">Payouts</h3>
          <p className="text-sm text-text-muted">Track your earnings and payout history.</p>
        </Link>
        {seller?.offers_commissions && (
          <Link href="/seller/commissions" className="card p-6 hover:shadow-md transition-shadow border-2 border-accent/10">
            <h3 className="font-headline font-semibold mb-2">Commissions</h3>
            <p className="text-sm text-text-muted">Manage bespoke design requests from customers.</p>
            {stats.pendingCommissions > 0 && (
              <span className="inline-block mt-2 text-xs text-accent font-medium">
                {stats.pendingCommissions} pending request{stats.pendingCommissions !== 1 ? 's' : ''} &rarr;
              </span>
            )}
          </Link>
        )}
        <Link href={`/sellers/${seller?.storefront_slug}`} className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-headline font-semibold mb-2">View Storefront</h3>
          <p className="text-sm text-text-muted">Preview your public storefront.</p>
        </Link>
      </div>
    </div>
  )
}
