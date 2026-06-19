'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { SellerProduct, PodProduct } from '@/types/database'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<(SellerProduct & { pod_product?: PodProduct }) | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('seller_products').select('*, pod_product:pod_products(*)').eq('id', id).single()
      .then(({ data }) => { setProduct(data); setLoading(false) })
  }, [id])

  const addToCart = () => {
    alert('Added to cart! (Cart functionality coming soon)')
  }

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!product) return <PublicLayout><div className="text-center py-16 text-text-muted">Product not found.</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {product.mockup_url ? (
              <img src={product.mockup_url} alt="Product" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-text-muted">Product Image</span>
            )}
          </div>
          <div>
            <p className="text-sm text-text-muted mb-2">{product.pod_product?.name || 'Product'}</p>
            <h1 className="text-3xl font-headline mb-4">${product.seller_price.toFixed(2)}</h1>
            <p className="text-text-muted mb-6">
              High-quality print on demand product. Shipped worldwide with tracking.
            </p>
            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={addToCart}>
                Add to Cart
              </Button>
              <Button variant="secondary" className="w-full" size="lg">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
