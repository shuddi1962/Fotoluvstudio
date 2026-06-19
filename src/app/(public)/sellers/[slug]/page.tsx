'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import ProductCard from '@/components/shop/ProductCard'
import Spinner from '@/components/ui/Spinner'
import type { SellerProfile, SellerProduct, PodProduct } from '@/types/database'

export default function SellerStorefrontPage() {
  const { slug } = useParams<{ slug: string }>()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<(SellerProduct & { pod_product?: PodProduct })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStorefront()
  }, [slug])

  const loadStorefront = async () => {
    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('storefront_slug', slug)
      .single()

    if (sellerData) {
      setSeller(sellerData)
      const { data: productData } = await supabase
        .from('seller_products')
        .select('*, pod_product:pod_products(*)')
        .eq('seller_id', sellerData.id)
        .eq('is_published', true)
      setProducts(productData || [])
    }
    setLoading(false)
  }

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!seller) return <PublicLayout><div className="text-center py-16 text-text-muted">Storefront not found.</div></PublicLayout>

  return (
    <PublicLayout>
      <div
        className="relative h-48 md:h-64 bg-accent"
        style={seller.banner_url ? { backgroundImage: `url(${seller.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-headline text-white">{seller.storefront_name}</h1>
            {seller.bio && <p className="text-white/80 mt-2 max-w-2xl">{seller.bio}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-headline mb-6">Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
