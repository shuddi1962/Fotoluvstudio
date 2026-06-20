'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import PublicLayout from "@/components/layout/PublicLayout"
import Button from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"
import { useCart } from "@/context/CartContext"

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirming' | 'complete'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<CheckoutStep>('shipping')

  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'stripe'>('stripe')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('review')
  }

  const handlePlaceOrder = async () => {
    setStep('confirming')
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const orderItems = items.map((item) => ({
        seller_product_id: item.seller_product_id,
        quantity: item.quantity,
        price: item.seller_product?.seller_price || 0,
        base_cost: 0,
        sync_product_id: item.seller_product?.pod_product?.printful_product_id || undefined,
      }))

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer_id: user?.id || null,
            guest_email: user ? undefined : shipping.email,
            total_amount: subtotal,
            payment_provider: paymentMethod,
            payment_reference: `ref_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            shipping_address: shipping,
            items: orderItems,
          }),
        }
      )

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setOrderId(data.order_id)
      await clearCart()
      setStep('complete')
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.')
      setStep('review')
    }
  }

  if (items.length === 0 && step !== 'complete') {
    return (
      <PublicLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-headline mb-4">Your cart is empty</h1>
          <Button onClick={() => router.push('/shop')}>Browse Shop</Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-8">Checkout</h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['shipping', 'payment', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s || (['confirming', 'complete'].includes(step) && ['shipping', 'payment', 'review'].indexOf(s) < ['shipping', 'payment', 'review'].indexOf(step as any))
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-text-muted'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm capitalize ${step === s ? 'text-text font-medium' : 'text-text-muted'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="card p-6 space-y-4">
            <h2 className="text-xl font-headline mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required className="input" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" className="input" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input required className="input" value={shipping.line1} onChange={(e) => setShipping({ ...shipping, line1: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Address Line 2 (optional)</label>
                <input className="input" value={shipping.line2} onChange={(e) => setShipping({ ...shipping, line2: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input required className="input" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input required className="input" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input required className="input" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select className="input" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })}>
                  <option value="US">United States</option>
                  <option value="NG">Nigeria</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full mt-4">Continue to Payment</Button>
          </form>
        )}

        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="card p-6 space-y-4">
            <h2 className="text-xl font-headline mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: 'stripe', label: 'Stripe', desc: 'Credit / debit card (US & International)' },
                { value: 'paystack', label: 'Paystack', desc: 'Popular in Nigeria & West Africa' },
                { value: 'flutterwave', label: 'Flutterwave', desc: 'Accepted across Africa' },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value as any)}
                    className="accent-accent"
                  />
                  <div>
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-text-muted">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button type="submit" size="lg" className="w-full mt-4">Review Order</Button>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-headline mb-4">Order Review</h2>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Items</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                        {item.seller_product?.mockup_url && (
                          <img src={item.seller_product.mockup_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.seller_product?.pod_product?.name || 'Product'}</p>
                        <p className="text-xs text-text-muted">Qty: {item.quantity} × ${(item.seller_product?.seller_price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="font-medium text-sm">${((item.seller_product?.seller_price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Shipping To</h3>
                <p className="text-sm">{shipping.name}</p>
                <p className="text-sm">{shipping.email}</p>
                <p className="text-sm">{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}</p>
                <p className="text-sm">{shipping.city}, {shipping.state} {shipping.zip}</p>
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-1">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Payment</h3>
                <p className="text-sm capitalize">{paymentMethod}</p>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-error/10 text-error text-sm p-3 rounded-lg">{error}</div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('payment')}>Back</Button>
              <Button size="lg" className="flex-1" onClick={handlePlaceOrder}>
                Place Order — ${subtotal.toFixed(2)}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <div className="card p-12 text-center">
            <Spinner />
            <p className="text-text-muted mt-4">Processing your order...</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="card p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-headline">Order Confirmed!</h2>
            <p className="text-text-muted">
              Your order <span className="font-mono text-accent">#{orderId?.slice(0, 8)}</span> has been placed.
            </p>
            <p className="text-sm text-text-muted">
              A confirmation email has been sent to <strong>{shipping.email}</strong>.
            </p>
            <div className="pt-4">
              <p className="text-sm text-text-muted mb-4">Create an account to track this and future orders.</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push('/register')}>Create Account</Button>
                <Button variant="secondary" onClick={() => router.push('/')}>Return Home</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
