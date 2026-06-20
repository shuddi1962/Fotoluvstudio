'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { SellerProduct, PodProduct } from '@/types/database'

export default function SellerProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<(SellerProduct & { pod_product?: PodProduct }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('seller_products')
      .select('*, pod_product:pod_products(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProduct(data as any)
        setLoading(false)
      })
  }, [id])

  const togglePublish = async () => {
    if (!product) return
    setPublishing(true)
    await supabase.from('seller_products').update({ is_published: !product.is_published }).eq('id', id)
    setProduct({ ...product, is_published: !product.is_published })
    setPublishing(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!product) return <div className="text-center py-16 text-text-muted">Product not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-accent hover:underline mb-4 inline-block">&larr; Back</button>
      <h1 className="text-2xl font-headline mb-6">{product.pod_product?.name || 'Product'} Details</h1>
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-text-muted">Price:</span> <span className="font-medium">${product.seller_price.toFixed(2)}</span></div>
          <div><span className="text-text-muted">Status:</span> <span className={`font-medium ${product.is_published ? 'text-success' : 'text-text-muted'}`}>{product.is_published ? 'Published' : 'Draft'}</span></div>
          <div><span className="text-text-muted">Created:</span> <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span></div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button onClick={togglePublish} disabled={publishing}>
            {publishing ? 'Updating...' : product.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/seller/products/${id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}
