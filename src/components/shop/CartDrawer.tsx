'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface CartItem {
  id: string
  productName: string
  price: number
  quantity: number
  mockupUrl?: string
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative p-2" aria-label="Open cart">
        <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-headline font-semibold">Cart ({items.length})</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-text-muted text-center py-8">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
