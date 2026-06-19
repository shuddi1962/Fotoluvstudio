import Image from 'next/image'
import Link from 'next/link'
import type { SellerProduct, PodProduct } from '@/types/database'

interface ProductCardProps {
  product: SellerProduct & { pod_product?: PodProduct }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/product/${product.id}`} className="group card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {product.mockup_url ? (
          <Image
            src={product.mockup_url}
            alt={`Product ${product.id}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-text-muted mb-1">{product.pod_product?.name || 'Product'}</p>
        <p className="font-medium">${product.seller_price.toFixed(2)}</p>
      </div>
    </Link>
  )
}
