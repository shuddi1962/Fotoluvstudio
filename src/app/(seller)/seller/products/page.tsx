'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { SellerProduct, PodProduct, Media } from '@/types/database'

type ProductWithDetails = SellerProduct & { pod_product?: PodProduct; media?: Media }

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('seller_products')
      .select('*, pod_product:pod_products(*), media:media(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline">My Products</h1>
        <Link href="/seller/upload"><Button>Upload New</Button></Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Upload a design and apply it to products to start selling."
          action={<Link href="/seller/upload"><Button>Upload Design</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} padding={false}>
              <div className="aspect-square bg-gray-100" />
              <div className="p-4">
                <p className="text-sm text-text-muted">{product.pod_product?.name}</p>
                <p className="font-semibold mt-1">${product.seller_price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${product.is_published ? 'bg-success' : 'bg-text-muted'}`} />
                  <span className="text-xs text-text-muted">{product.is_published ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
