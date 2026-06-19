'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { SellerProfile } from '@/types/database'

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('seller_profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSellers(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Seller Management</h1>
      {sellers.length === 0 ? (
        <EmptyState title="No sellers yet" />
      ) : (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <Link key={seller.id} href={`/admin/sellers/${seller.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{seller.storefront_name}</p>
                    <p className="text-sm text-text-muted">/{seller.storefront_slug}</p>
                  </div>
                  {seller.approved_at ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
