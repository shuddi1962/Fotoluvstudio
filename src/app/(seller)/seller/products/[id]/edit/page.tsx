'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import type { SellerProduct, PodProduct } from '@/types/database'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<(SellerProduct & { pod_product?: PodProduct }) | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('seller_products').select('*, pod_product:pod_products(*)').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setProduct(data)
          setPrice(String(data.seller_price))
        }
        setLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('seller_products').update({ seller_price: Number(price) }).eq('id', id)
    setSaving(false)
    router.push('/seller/products')
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!product) return <div className="text-center py-16 text-text-muted">Product not found.</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Edit Product</h1>
      <Card className="space-y-4">
        <p className="text-sm text-text-muted">Product: {product.pod_product?.name || 'Unknown'}</p>
        <Input label="Your Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={1} step={0.01} />
        <div className="flex gap-3">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          <Button variant="ghost" onClick={() => router.push('/seller/products')}>Cancel</Button>
        </div>
      </Card>
    </div>
  )
}
