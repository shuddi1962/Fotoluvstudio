'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from '@/components/layout/PublicLayout'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useCart } from '@/context/CartContext'
import { getDemoProducts } from '@/lib/demo-data'
import type { SellerProduct, PodProduct, SellerProfile } from '@/types/database'

interface FullProductData extends SellerProduct {
  pod_product?: PodProduct & { available_sizes: string[]; available_variants: any }
  seller_profile?: Pick<SellerProfile, 'storefront_name' | 'storefront_slug'>
  media?: { storage_path_derivative: string | null; title: string | null }
}

const GRADIENTS = [
  ['#2D6E5E', '#1E4F42'],
  ['#B68A2E', '#8A6A1E'],
  ['#4A7C6F', '#2D6E5E'],
  ['#D4A843', '#B68A2E'],
  ['#3D8B7A', '#2D6E5E'],
  ['#C49A35', '#A67C25'],
]

function svgGradient(idx: number, label: string): string {
  const [c1, c2] = GRADIENTS[idx % GRADIENTS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect fill="url(#g)" width="800" height="800"/>
    <text x="400" y="380" font-family="Georgia,serif" font-size="48" fill="rgba(255,255,255,0.3)" text-anchor="middle">${label}</text>
    <text x="400" y="440" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.2)" text-anchor="middle">fotoluvstudio</text>
  </svg>`
  if (typeof btoa === 'function') return `data:image/svg+xml;base64,${btoa(svg)}`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const MOCKUP_PHOTOS = GRADIENTS.map((_, i) => svgGradient(i, ['Canvas', 'Framed', 'Mug', 'Poster', 'Tote', 'Tee'][i] || 'Product'))

function buildVariantMockups(baseIdx: number, size: string, color: string): string[] {
  return [
    MOCKUP_PHOTOS[baseIdx % MOCKUP_PHOTOS.length],
    MOCKUP_PHOTOS[(baseIdx + 1) % MOCKUP_PHOTOS.length],
    MOCKUP_PHOTOS[(baseIdx + 2) % MOCKUP_PHOTOS.length],
  ]
}

const DEMO_PRODUCT: FullProductData = {
  id: 'demo',
  seller_id: 'demo-seller',
  media_id: 'demo-media',
  pod_product_id: 'demo-pod',
  selected_variant: null,
  seller_price: 39.99,
  mockup_url: MOCKUP_PHOTOS[0],
  is_published: true,
  created_at: new Date().toISOString(),
  pod_product: {
    id: 'demo-pod',
    printful_product_id: null,
    category: 'wall_art',
    name: 'Canvas Print',
    base_cost: 15,
    available_sizes: ['8×10"', '11×14"', '16×20"', '20×30"'],
    available_variants: ['White Frame', 'Black Frame', 'No Frame'],
    is_active: true,
    synced_at: new Date().toISOString(),
  },
  seller_profile: {
    storefront_name: 'Demo Artist',
    storefront_slug: 'demo-artist',
  },
  media: {
    storage_path_derivative: MOCKUP_PHOTOS[0],
    title: 'Demo Artwork',
  },
}

const SIZE_MOCKUPS: Record<string, string[]> = {
  '8×10"': MOCKUP_PHOTOS.slice(0, 3),
  '11×14"': MOCKUP_PHOTOS.slice(1, 4),
  '16×20"': MOCKUP_PHOTOS.slice(2, 5),
  '20×30"': MOCKUP_PHOTOS.slice(3, 6),
}

const COLOR_MOCKUPS: Record<string, string[]> = {
  'White Frame': MOCKUP_PHOTOS.slice(0, 3),
  'Black Frame': MOCKUP_PHOTOS.slice(1, 4),
  'No Frame': MOCKUP_PHOTOS.slice(2, 5),
}

const CATEGORY_MOCKUPS: Record<string, string[]> = {
  wall_art: MOCKUP_PHOTOS.slice(0, 4),
  home_decor: MOCKUP_PHOTOS.slice(1, 5),
  apparel: MOCKUP_PHOTOS.slice(2, 6),
  lifestyle: [MOCKUP_PHOTOS[3], MOCKUP_PHOTOS[4], MOCKUP_PHOTOS[0]],
  stationery: [MOCKUP_PHOTOS[4], MOCKUP_PHOTOS[5], MOCKUP_PHOTOS[1]],
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<FullProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [cartError, setCartError] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})
  const supabase = createClient()
  const { addItem, itemCount } = useCart()

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('seller_products')
        .select('*, pod_product:pod_products(*), seller_profile:seller_profiles!seller_id(storefront_name, storefront_slug), media:media(storage_path_derivative, title)')
        .eq('id', id)
        .single()

      if (data) {
        setProduct(data as FullProductData)
        const pod = (data as any).pod_product
        if (pod?.available_sizes?.length) setSelectedSize(pod.available_sizes[0])
        if (pod?.available_variants?.length) {
          const firstVar = pod.available_variants[0]
          if (typeof firstVar === 'string') setSelectedColor(firstVar)
          else if (typeof firstVar === 'object' && firstVar.color) setSelectedColor(firstVar.color)
        }
      } else {
        const demoProd = DEMO_PRODUCT
        setProduct(demoProd)
        if (demoProd.pod_product?.available_sizes?.length) setSelectedSize(demoProd.pod_product.available_sizes[0])
        if (demoProd.pod_product?.available_variants?.length) setSelectedColor(demoProd.pod_product.available_variants[0])
      }
      setLoading(false)
    })()
  }, [id])

  const handleAddToCart = async () => {
    setCartError(false)
    try {
      await addItem(id)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch {
      setCartError(true)
      setTimeout(() => setCartError(false), 3000)
    }
  }

  const sizes: string[] = product?.pod_product?.available_sizes || []
  const colors: string[] = product?.pod_product?.available_variants || []

  const category = product?.pod_product?.category || 'wall_art'

  const variantImages = useMemo(() => {
    const sizeKey = selectedSize || Object.keys(SIZE_MOCKUPS)[0]
    const colorKey = selectedColor || 'White Frame'
    const categoryImages = CATEGORY_MOCKUPS[category] || CATEGORY_MOCKUPS.wall_art
    const sizeImages = SIZE_MOCKUPS[sizeKey] || categoryImages
    const colorImages = COLOR_MOCKUPS[colorKey] || categoryImages
    const merged = sizeImages.map((img, i) => colorImages[i] || img)
    return merged.length > 0 ? merged : categoryImages
  }, [selectedSize, selectedColor, category])

  const currentMockup = variantImages[selectedImage] || variantImages[0] || product?.mockup_url || product?.media?.storage_path_derivative || '/images/placeholder-1.svg'

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
            {/* Main preview */}
            <div className="aspect-square bg-gradient-to-br from-accent/10 to-gold-bg/20 rounded-xl overflow-hidden relative flex items-center justify-center">
              {imgErrors[-1] ? (
                <div className="text-center p-8">
                  <svg className="w-16 h-16 mx-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted text-sm mt-2">{product.pod_product?.name || 'Product'}</p>
                </div>
              ) : (
                <img
                  src={currentMockup}
                  alt={product.pod_product?.name || 'Product'}
                  className="w-full h-full object-cover"
                  onError={() => setImgErrors({ ...imgErrors, [-1]: true })}
                />
              )}
              {selectedSize && (
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {selectedSize}{selectedColor ? ` · ${selectedColor}` : ''}
                </div>
              )}
            </div>
            {/* Thumbnail strip */}
            {variantImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {variantImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImage(idx); setImgErrors({}) }}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-accent' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    {imgErrors[idx] ? (
                      <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setImgErrors({ ...imgErrors, [idx]: true })}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* 3D view button */}
            <button className="flex items-center gap-2 text-sm text-accent hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              3D View
            </button>
          </div>

          {/* Right Column — Purchase Panel */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-accent font-medium mb-1 capitalize">
                {category.replace('_', ' ') || 'Product'}
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
                      onClick={() => { setSelectedSize(size); setSelectedImage(0) }}
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
                        onClick={() => { setSelectedColor(colorName); setSelectedImage(0) }}
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
            {cartError && (
              <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
                Could not add to cart. The item has been saved locally. <a href="/cart" className="underline">View cart</a>
              </div>
            )}
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
