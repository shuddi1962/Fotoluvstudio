'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from "@/components/layout/PublicLayout"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Spinner from "@/components/ui/Spinner"
import { useCart } from "@/context/CartContext"

export default function CartPage() {
  const { items, loading, subtotal, updateQuantity, removeItem, groupedBySeller } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)

  if (loading) return <PublicLayout><div className="flex justify-center py-16"><Spinner /></div></PublicLayout>

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-headline">Shopping Cart</h1>
          <span className="text-sm text-text-muted">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Your cart is empty"
            description="Browse the shop to add items to your cart."
            action={<Link href="/shop"><Button>Browse Shop</Button></Link>}
          />
        ) : (
          <div className="space-y-8">
            {groupedBySeller.map((group) => (
              <div key={group.sellerId} className="card overflow-hidden">
                <div className="px-6 py-4 bg-accent/5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-accent">Sold by {group.sellerName}</span>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 sm:p-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.seller_product?.mockup_url ? (
                          <img src={item.seller_product.mockup_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/product/${item.seller_product_id}`}
                          className="text-sm font-medium hover:text-accent transition-colors truncate block"
                        >
                          {item.seller_product?.pod_product?.name || 'Product'}
                        </Link>
                        <p className="text-sm text-text-muted mt-0.5">
                          ${(item.seller_product?.seller_price || 0).toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 transition-colors text-text-muted"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 transition-colors text-text-muted"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold">
                          ${((item.seller_product?.seller_price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-text-muted hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="card p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                  <span>Estimated Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full mt-6">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/shop" className="block text-center text-sm text-accent hover:underline mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
