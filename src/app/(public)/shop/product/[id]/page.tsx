'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useCart } from '@/context/CartContext'
import type { SellerProduct, PodProduct, SellerProfile } from '@/types/database'

interface FullProductData extends SellerProduct {
  pod_product?: PodProduct & { available_sizes: string[]; available_variants: any }
  seller_profile?: Pick<SellerProfile, 'storefront_name' | 'storefront_slug'>
  media?: { storage_path_derivative: string | null; title: string | null }
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<FullProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)
  const supabase = createClient()
  const { addItem } = useCart()

  useEffect(() => {
    supabase
      .from('seller_products')
      .select('*, pod_product:pod_products(*), seller_profile:seller_profiles!seller_id(storefront_name, storefront_slug), media:media(storage_path_derivative, title)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProduct(data as FullProductData)
          const pod = (data as any).pod_product
          if (pod?.available_sizes?.length) setSelectedSize(pod.available_sizes[0])
          if (pod?.available_variants?.length) {
            const firstVar = pod.available_variants[0]
            if (typeof firstVar === 'string') setSelectedColor(firstVar)
            else if (typeof firstVar === 'object' && firstVar.color) setSelectedColor(firstVar.color)
          }
        }
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = async () => {
    await addItem(id)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const sizes: string[] = product?.pod_product?.available_sizes || []
  const colors: string[] = product?.pod_product?.available_variants || []

  const currentPrice = product?.seller_price || 0

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>
  if (!product) return <PublicLayout><div className="text-center py-16 text-text-muted">Product not found.</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <a href="/shop" className="hover:text-accent">Shop</a>
          <span>/</span>
          <a href={`/shop/${product.pod_product?.category}`} className="hover:text-accent capitalize">
            {product.pod_product?.category?.replace('_', ' ') || 'Products'}
          </a>
          <span>/</span>
          <span className="text-text truncate max-w-[200px]">{product.pod_product?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column — Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-accent/10 to-gold-bg/20 rounded-xl overflow-hidden relative">
              {product.mockup_url ? (
                <img
                  src={product.mockup_url}
                  alt={product.pod_product?.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : product.media?.storage_path_derivative ? (
                <img
                  src={product.media.storage_path_derivative}
                  alt={product.media.title || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Purchase Panel */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-accent font-medium mb-1 capitalize">
                {product.pod_product?.category?.replace('_', ' ') || 'Product'}
              </p>
              <h1 className="text-3xl md:text-4xl font-headline text-text leading-tight">
                {product.media?.title || 'Untitled'} — {product.pod_product?.name}
              </h1>
              {product.seller_profile && (
                <a
                  href={`/sellers/${product.seller_profile.storefront_slug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mt-2 transition-colors"
                >
                  by {product.seller_profile.storefront_name}
                </a>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-headline font-bold text-accent">
              ${currentPrice.toFixed(2)}
            </div>

            {/* Variant Selectors */}
            {sizes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-text mb-2 block">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'border-accent bg-accent text-white'
                          : 'border-border hover:border-accent text-text'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-text mb-2 block">Color / Variant</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: any) => {
                    const colorName = typeof color === 'string' ? color : color.color || color.name || 'Default'
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                          selectedColor === colorName
                            ? 'border-accent bg-accent text-white'
                            : 'border-border hover:border-accent text-text'
                        }`}
                      >
                        {colorName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
            >
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </Button>

            {/* Product Details */}
            <div className="border-t border-border pt-6 space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-text">
                  Product Details
                  <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-text-muted space-y-2">
                  <p>Premium quality {product.pod_product?.name?.toLowerCase() || 'product'}.</p>
                  <p>Archival-grade materials with vibrant, long-lasting color reproduction.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-text">
                  Design Details
                  <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-text-muted space-y-2">
                  {product.media?.title && <p>Artwork: {product.media.title}</p>}
                  <p>Original photography/design by {product.seller_profile?.storefront_name || 'the artist'}.</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-text">
                  Dimensions
                  <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-text-muted">
                  <p>Selected variant: {selectedSize || 'Standard'}{selectedColor ? `, ${selectedColor}` : ''}</p>
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-text">
                  Shipping
                  <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-text-muted space-y-1">
                  <p>Worldwide shipping with tracking.</p>
                  <p>Estimated delivery: 5-10 business days.</p>
                </div>
              </details>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-text-muted">Share:</span>
              {['twitter', 'facebook', 'pinterest'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => {
                    const urls: Record<string, string> = {
                      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}`,
                    }
                    window.open(urls[platform], '_blank', 'width=600,height=400')
                  }}
                  className="text-text-muted hover:text-accent transition-colors capitalize text-sm"
                >
                  {platform}
                </button>
              ))}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
                className="text-text-muted hover:text-accent transition-colors text-sm"
              >
                Copy link
              </button>
            </div>

            {/* Trust Footer */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <svg className="w-4 h-4 text-success shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Money-back guarantee. <a href="/policies" className="text-accent hover:underline">View return policy</a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
