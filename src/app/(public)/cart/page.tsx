'use client'

import { useState } from 'react'
import PublicLayout from "@/components/layout/PublicLayout"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"

export default function CartPage() {
  const [items] = useState<any[]>([])

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-8">Shopping Cart</h1>
        {items.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Your cart is empty"
            description="Browse the shop to add items to your cart."
            action={<Button onClick={() => window.location.href = '/shop'}>Browse Shop</Button>}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price}</p>
              </div>
            ))}
            <div className="card p-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>$0.00</span>
              </div>
              <Button className="w-full mt-4" size="lg">Proceed to Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
