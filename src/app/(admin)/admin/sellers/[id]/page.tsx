'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { SellerProfile, SellerProduct } from '@/types/database'

export default function AdminSellerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('seller_profiles').select('*').eq('id', id).single(),
      supabase.from('seller_products').select('*').eq('seller_id', id),
    ]).then(([sellerRes, productsRes]) => {
      setSeller(sellerRes.data)
      setProducts(productsRes.data || [])
      setLoading(false)
    })
  }, [id])

  const approveSeller = async () => {
    await supabase.from('seller_profiles').update({ approved_at: new Date().toISOString() }).eq('id', id)
    setSeller(prev => prev ? { ...prev, approved_at: new Date().toISOString() } : null)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline">{seller?.storefront_name}</h1>
            <p className="text-text-muted">/{seller?.storefront_slug}</p>
          </div>
          <div className="flex items-center gap-3">
            {seller?.approved_at ? <Badge variant="success">Approved</Badge> : <Button size="sm" onClick={approveSeller}>Approve Seller</Button>}
          </div>
        </div>
        {seller?.bio && <p className="mt-4 text-text-muted">{seller.bio}</p>}
      </div>
      <h2 className="text-xl font-headline mb-4">Products ({products.length})</h2>
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">${product.seller_price.toFixed(2)}</p>
              </div>
              <Badge variant={product.is_published ? 'success' : 'default'}>{product.is_published ? 'Published' : 'Draft'}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
